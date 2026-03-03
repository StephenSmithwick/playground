import {Agent, handleResponse, handleToolCalls, Message} from './index.js';
import {loadLocalModel} from '../models.js';
import {AgentEventEmitter, AgentEventListeners} from './agent-events.js';
import {transformTestMessages} from '../tests/vision-fixtures.js';

export default async function VisionAgent(
	listeners: AgentEventListeners,
): Promise<Agent> {
	const llm = await loadLocalModel('visionLLM');
	let messages: Message[] = [];
	let events = new AgentEventEmitter();

	events.all(listeners);

	async function send(messagesToSend: Message[]) {
		messages = await Promise.all(messagesToSend.map(transformTestMessages));

		try {
			await llm.load();
			const res = await llm.chat({
				messages,
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

	function suggest() {
		return '{{fish.png}} Please describe the image.';
	}

	return {send, suggest};
}
