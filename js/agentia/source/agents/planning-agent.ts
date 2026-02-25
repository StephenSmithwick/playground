import {Agent, handleResponse, Message} from './index.js';
import {loadLocalModel} from '../models.js';
import {AgentEventListeners, AgentEventEmitter} from './agent-events.js';

export default async function PlanningAgent(
	listeners: AgentEventListeners,
): Promise<Agent> {
	const smallLLM = await loadLocalModel('smallLLM');
	const events = new AgentEventEmitter();
	events.all(listeners);
	async function send(messages: Message[]) {
		try {
			await smallLLM.load();
			const res = await smallLLM.chat({
				messages: messages,
				stream: true,
			});

			handleResponse(res, events);
		} catch (err) {
			events.emit('error', `Request failed: ${(err as Error).message}`);
		}
	}
	return {
		send,
	};
}
