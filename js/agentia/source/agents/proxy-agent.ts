import PlanningAgent from './planning-agent.js';
import PythonAgent from './python-agent.js';
import {Message, Agent} from './index.js';
import {AgentEventListeners} from './agent-events.js';
import VisionAgent from './vision-agent.js';

const KICK_MESSAGE: Message = {
	role: 'developer',
	content:
		'You are very knowledgeable. An expert. Think and respond with confidence. ',
};

export default async function ProxyAgent(
	appListeners: AgentEventListeners,
): Promise<Agent> {
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
	const planning = await PlanningAgent(listeners);
	const python = await PythonAgent(listeners);
	const vision = await VisionAgent(listeners);

	function chooseAgent(): Agent {
		if (true) {
			return vision;
		} else {
			return false ? python : planning;
		}
	}
	async function send(messagesToSend: Message[]) {
		messages = messagesToSend;
		// temporarily hardcode talking to the PythonAgent
		chooseAgent().send(messages);
	}

	function suggest(): string {
		return chooseAgent().suggest();
	}
	return {send, suggest};
}
