import PlanningAgent from './planning-agent.js';
import PythonAgent from './python-agent.js';
import {log_to_file} from '../logs.js';

interface ToolCall {
	function: {
		name: string;
		arguments: string;
	};
	id: string;
}

export interface Message {
	role?: string;
	reasoning_content?: string;
	content?: string;
	tool_calls?: ToolCall[];
}

interface ResponsePart {
	choices: {
		finish_reason?: string;
		delta?: Message;
		message?: Message;
	}[];
}

export interface Agent {
	send: (messages: Message[]) => Promise<void>;
}

export interface AgentEvents {
	onResponseStart?: () => void;
	onResponseEnd?: (finish_reason: string) => void;
	onReasonPart?: (reason: string) => void;
	onContentPart?: (content: string) => void;
	onToolCall?: (message: Message) => Promise<void>;
	onToolResponse?: (messages: Message[]) => void;
	onError?: (error: string) => void;
}

const decoder = new TextDecoder();
function lines(chunk: Uint8Array<ArrayBuffer>): string[] {
	return decoder
		.decode(chunk, {stream: true})
		.replace(/^data:\s*/gm, '')
		.replace(/\[DONE\]/g, '')
		.split('\n')
		.filter(line => line.trim() !== '');
}

export async function handleResponse(res: Response, events: AgentEvents) {
	if (!res.body) throw new Error('Response body missing.');

	let reasonBuf = '';
	let contentBuf = '';

	for await (const chunks of res.body) {
		events.onResponseStart?.();
		for (const line of lines(chunks)) {
			try {
				handleResponsePart(JSON.parse(log_to_file('response.json', line)), {
					...events,
					onContentPart: (val: string) => {
						events.onContentPart?.((contentBuf += val));
					},
					onReasonPart: (val: string) => {
						events.onReasonPart?.((reasonBuf += val));
					},
				});
			} catch {
				events.onError?.(`Unable to parse: ${line}`);
			}
		}
	}
}

function handleResponsePart(data: ResponsePart, events: AgentEvents) {
	for (const choice of data.choices) {
		choice.message && handleMessage(choice.message, events);
		choice.delta && handleMessage(choice.delta, events);
		choice.finish_reason && events.onResponseEnd?.(choice.finish_reason);
	}
}

function handleMessage(message: Message, events: AgentEvents) {
	message.reasoning_content && events.onReasonPart?.(message.reasoning_content);
	message.content && events.onContentPart?.(message.content);
	message.tool_calls && events.onToolCall?.(message);
}

export default function AgentProxy(events: AgentEvents): Agent {
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
