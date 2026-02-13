import {Agent, handleResponse, AgentEvents, Message} from './index.js';
import {log_to_file} from '../logs.js';

export default function PlanningAgent(url: string, events: AgentEvents): Agent {
	async function send(messages: Message[]) {
		try {
			const res = await fetch(url, {
				method: 'POST',
				body: log_to_file(
					'request.json',
					JSON.stringify({
						messages: messages,
						stream: true,
					}),
				),
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
