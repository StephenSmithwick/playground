import {
	Agent,
	handleResponse,
	handleToolCalls,
	AgentEvents,
	Message,
	ToolHandler,
} from './index.js';
import {toolJson} from '../tools/index.js';
import Python from '../tools/python.js';
import {mediumLLM} from '../models.js';

const python = Python();
const pythonDescription = toolJson(python);
async function callPython(id: string, script: string): Promise<Message> {
	const {stdout} = await python.call(script);
	return {
		role: 'tool',
		name: python.name,
		content: stdout,
		tool_call_id: id,
	};
}
const toolHandlers = new Map<string, ToolHandler>([
	[python.name, {call: callPython}],
]);

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
						const toolResponses = handleToolCalls(
							message.tool_calls,
							toolHandlers,
						);
						events.onToolResponse?.([
							...messages,
							message,
							...(await toolResponses),
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
