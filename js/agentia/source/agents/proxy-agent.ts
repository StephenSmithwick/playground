import PlanningAgent from './planning-agent.js';
import PythonAgent from './python-agent.js';
import {Message, Agent} from './index.js';
import {AgentEventListeners} from './agent-events.js';

const KICK_MESSAGE: Message = {
	role: 'developer',
	content:
		'You are very knowledgeable. An expert. Think and respond with confidence. ',
};

export default function ProxyAgent(appListeners: AgentEventListeners): Agent {
	let didRespond = false;
	let messages: Message[] = [];

	function convinceLlmToRespond(finish_reason: string) {
		if (finish_reason !== 'tool_calls' && !didRespond) {
			send([...messages, KICK_MESSAGE]);
		}
	}

	const listeners: AgentEventListeners = [
		...appListeners,
		['contentPart', () => (didRespond = true)],
		['responseEnd', convinceLlmToRespond],
	];
	const planning = PlanningAgent(listeners);
	const python = PythonAgent(listeners);

	async function send(messagesToSend: Message[]) {
		messages = messagesToSend;
		// temporarily hardcode talking to the PythonAgent
		if (true) {
			python.send(messages);
		} else {
			planning.send(messages);
		}
	}
	return {
		send,
	};
}
