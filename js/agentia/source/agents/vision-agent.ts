import {Agent, handleResponse, Message} from './index.js';
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

	function suggest() {
		return '{{fish.png}} Please describe the image.';
	}

	return {send, suggest};
}
