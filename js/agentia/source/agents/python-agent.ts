import {Agent, handleResponse, AgentEvents, Message} from './index.js';
import {log_to_file} from '../logs.js';
import {toolJson} from '../functions/index.js';
import Python from '../functions/python.js';
import {mediumLLM} from '../models.js';

const python = Python();
const pythonDescription = toolJson(python);

export default function PythonAgent(events: AgentEvents): Agent {
	async function send(messages: Message[]) {
		try {
			await mediumLLM.load();
			const res = await mediumLLM.chat({
				messages: messages,
				tools: [pythonDescription],
			});

			handleResponse(res, {
				...events,
				onToolCall: async function (message: Message) {
					if (message.tool_calls) {
						events.onToolCall?.(message);
						const toolPromises = message.tool_calls.map(
							async ({function: f, id}) => {
								const args = JSON.parse(f.arguments);
								switch (f.name) {
									case pythonDescription.function.name:
										const {stdout} = await python.call(args);
										const toolResponse: Message = {
											role: 'tool',
											name: f.name,
											content: stdout,
											tool_call_id: id,
										};
										return log_to_file('tools.json', toolResponse);
									default:
										return Promise.reject(
											`Unable to handle ${JSON.stringify(message)}`,
										);
								}
							},
						);

						events.onToolResponse?.([
							...messages,
							message,
							...(await Promise.all(toolPromises)),
						]);
					}
				},
			});
		} catch (err: unknown) {
			events.onError?.(`Request failed: ${(err as Error).message}`);
		}
	}
	return {
		send,
	};
}
