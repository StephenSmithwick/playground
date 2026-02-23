import PlanningAgent from './planning-agent.js';
import PythonAgent from './python-agent.js';
import {Message, Agent, AgentEvents} from './index.js';

export default function ProxyAgent(events: AgentEvents): Agent {
	let history: Message[] = [];
	let didRespond = false;
	const planning = PlanningAgent(events);
	const python = PythonAgent({
		...events,
		onToolResponse: function (messages: Message[]) {
			history = messages;
			python.send(messages);
		},
		onContentPart: function (content) {
			didRespond = true;
			events.onContentPart?.(content);
		},
		onResponseEnd: function (finish_reason) {
			if (finish_reason !== 'tool_calls' && !didRespond) {
				python.send([
					...history,
					{
						role: 'developer',
						content:
							'You are very knowledgeable. An expert. Think and respond with confidence. ',
					},
				]);
			}
		},
	});

	async function send(messages: Message[]) {
		// temporarily hardcode talking to the PythonAgent
		if (true) {
			didRespond = false;
			python.send(messages);
		} else {
			planning.send(messages);
		}
	}
	return {
		send,
	};
}
