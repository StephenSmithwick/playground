import {
	Agent,
	handleResponse,
	handleToolCalls,
	Message,
	ToolHandler,
} from './index.js';
import {toolJson} from '../tools/index.js';
import Python from '../tools/python.js';
import {loadLocalModel} from '../models.js';
import {AgentEventEmitter, AgentEventListeners} from './agent-events.js';

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

export default async function PythonAgent(
	listeners: AgentEventListeners,
): Promise<Agent> {
	const mediumLLM = await loadLocalModel('mediumLLM');
	let messages: Message[] = [];
	let events = new AgentEventEmitter();

	events.all(listeners);

	async function send(messagesToSend: Message[]) {
		messages = messagesToSend;
		try {
			await mediumLLM.load();
			const res = await mediumLLM.chat({
				messages: messages,
				tools: [pythonDescription],
			});

			handleResponse(res, events);
		} catch (err: unknown) {
			events.emit('error', `Request failed: ${(err as Error).message}`);
		}
	}

	// I'm worried this might result in a neverending circular event loop:
	// [send] -> [event.emit('toolCall')] -> [send] -> [...]
	events.on('toolCall', async function (message: Message) {
		if (message.tool_calls) {
			const toolResponses = handleToolCalls(message.tool_calls, toolHandlers);
			send([...messages, message, ...(await toolResponses)]);
		}
	});

	return {
		send,
	};
}
