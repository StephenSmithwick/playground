import PlanningAgent from './planning-agent.js';
import PythonAgent from './python-agent.js';
import {Message, Agent} from './index.js';
import {AgentEventEmitter, AgentEventListeners} from './agent-events.js';
import VisionAgent from './vision-agent.js';
import {enrichContext} from '../wyrmstore.js';

const KICK_MESSAGE: Message = {
	role: 'developer',
	content:
		'You are very knowledgeable. An expert. Think and respond with confidence. ',
};

export default async function ProxyAgent(
	appListeners: AgentEventListeners,
): Promise<Agent> {
	const events = new AgentEventEmitter();
	events.all(appListeners);
	let didRespond = false;
	let conversation: Message[] = [];
	let requestMessages: Message[] = [];
	let assistantReason = '';
	let assistantContent = '';

	function convinceLlmToRespond(finish_reason: string) {
		if (finish_reason !== 'tool_calls' && !didRespond) {
			void chooseAgent().send([...requestMessages, KICK_MESSAGE]);
		}
	}

	function rememberAssistantResponse(finish_reason: string) {
		if (finish_reason === 'tool_calls') return;
		if (!assistantReason && !assistantContent) return;

		conversation.push({
			role: 'assistant',
			...(assistantReason ? {reasoning_content: assistantReason} : {}),
			...(assistantContent ? {content: assistantContent} : {}),
		});
	}

	const listeners: AgentEventListeners = [
		...appListeners,
		[
			'responseStart',
			() => {
				didRespond = false;
				assistantReason = '';
				assistantContent = '';
			},
		],
		['reasonPart', (reason: string) => (assistantReason = reason)],
		['contentPart', () => (didRespond = true)],
		['contentPart', (content: string) => (assistantContent = content)],
		['responseEnd', rememberAssistantResponse],
		['responseEnd', convinceLlmToRespond],
	];
	const planning = await PlanningAgent(listeners);
	const python = await PythonAgent(listeners);
	const vision = await VisionAgent(listeners);

	function chooseAgent(): Agent {
		if (true) {
			return python;
		} else {
			return false ? vision : planning;
		}
	}
	async function send(messagesToSend: Message[]) {
		conversation.push(...messagesToSend);

		try {
			requestMessages = await enrichContext(conversation);
			await chooseAgent().send(requestMessages);
		} catch (error) {
			events.emit(
				'error',
				`Context request failed: ${(error as Error).message}`,
			);
		}
	}

	function suggest(): string {
		return chooseAgent().suggest();
	}
	return {send, suggest};
}
