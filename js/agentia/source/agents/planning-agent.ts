import {Agent, handleResponse, AgentEvents, Message} from './index.js';
import {smallLLM} from '../models.js';

export default function PlanningAgent(events: AgentEvents): Agent {
	async function send(messages: Message[]) {
		try {
			await smallLLM.load();
			const res = await smallLLM.chat({
				messages: messages,
				stream: true,
			});

			handleResponse(res, events);
		} catch (err: unknown) {
			events.onError?.(`Request failed: ${(err as Error).message}`);
		}
	}
	return {
		send,
	};
}
