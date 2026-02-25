import {log_to_file} from '../logs.js';
import {AgentEventEmitter} from './agent-events.js';

interface ToolCall {
	function: {
		name: string;
		arguments: string;
	};
	id: string;
}

export interface Message {
	role?: string;
	name?: string;
	reasoning_content?: string;
	content?: string;
	tool_call_id?: string;
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

const decoder = new TextDecoder();
function lines(chunk: Uint8Array<ArrayBuffer>): string[] {
	return decoder
		.decode(chunk, {stream: true})
		.replace(/^data:\s*/gm, '')
		.replace(/\[DONE\]/g, '')
		.split('\n')
		.filter(line => line.trim() !== '');
}

export async function handleResponse(res: Response, events: AgentEventEmitter) {
	if (!res.body) throw new Error('Response body missing.');

	let buf = {reason: '', content: ''};

	for await (const chunks of res.body) {
		events.emit('responseStart');
		for (const line of lines(chunks)) {
			try {
				const response = JSON.parse(line);
				log_to_file('chat.json', {response});
				handleResponsePart(response, events, buf);
			} catch {
				events.emit('error', `Unable to parse: ${line}`);
			}
		}
	}
}

export interface ToolHandler {
	call: (id: string, args: any) => Promise<Message>;
}

export async function handleToolCalls(
	toolCalls: ToolCall[],
	toolHandlers: Map<string, ToolHandler>,
): Promise<Message[]> {
	return Promise.all(
		toolCalls.map(async toolCall => {
			log_to_file('tools.json', {toolCall});
			const args = JSON.parse(toolCall.function.arguments);
			const toolHandler = toolHandlers.get(toolCall.function.name);
			if (!toolHandler) {
				return Promise.reject(`Unable to handle ${JSON.stringify(toolCall)}`);
			}

			const toolResponse = await toolHandler.call(toolCall.id, args);
			log_to_file('tools.json', {toolResponse});
			return toolResponse;
		}),
	);
}

interface Buffer {
	reason: string;
	content: string;
}

function handleResponsePart(
	data: ResponsePart,
	events: AgentEventEmitter,
	buf: Buffer,
) {
	for (const choice of data.choices) {
		choice.message && handleMessage(choice.message, events);
		choice.delta && handleDelta(choice.delta, events, buf);
		choice.finish_reason && events.emit('responseEnd', choice.finish_reason);
	}
}

// TODO: consider moving buffer logic to top level
function handleDelta(msg: Message, events: AgentEventEmitter, buf: Buffer) {
	if (msg.reasoning_content) {
		buf.reason += msg.reasoning_content;
		events.emit('reasonPart', buf.reason);
	}
	if (msg.content) {
		buf.content += msg.content;
		events.emit('contentPart', buf.content);
	}
	// Beware: In my tests Delta tool calls are problematic - llm does not wait for a response
	msg.tool_calls && events.emit('toolCall', msg);
}

function handleMessage(msg: Message, events: AgentEventEmitter) {
	msg.reasoning_content && events.emit('reasonPart', msg.reasoning_content);
	msg.content && events.emit('contentPart', msg.content);
	msg.tool_calls && events.emit('toolCall', msg);
}
