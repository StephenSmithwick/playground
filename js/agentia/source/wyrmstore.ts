import * as fs from 'node:fs';
import {createConnection} from 'node:net';
import * as path from 'node:path';
import process from 'node:process';
import type {Message} from './agents/index.js';
import {log_to_file} from './logs.js';

const DEFAULT_SOCKET_PATH = '/tmp/memoryd.sock';
const TOPIC_PREFIX = 'agentia';

interface WyrmStoreMessage {
	role: string;
	content: string;
	tool_calls?: unknown;
}

interface WyrmStoreRequest {
	messages: WyrmStoreMessage[];
	memory_in: {
		topic_id: string;
	};
}

interface WyrmStoreResponse {
	messages: WyrmStoreMessage[];
}

function contentToText(content: Message['content']): string {
	if (typeof content === 'string') return content;
	if (!content) return '';

	return content
		.filter(part => part.type === 'text' && typeof part.text === 'string')
		.map(part => part.text)
		.join('\n');
}

function toWyrmStoreMessage(message: Message): WyrmStoreMessage | null {
	if (!message.role) return null;

	return {
		role: message.role,
		content: contentToText(message.content),
		...(message.tool_calls ? {tool_calls: message.tool_calls} : {}),
	};
}

function toAgentMessage(message: WyrmStoreMessage): Message {
	return {
		role: message.role as Message['role'],
		content: message.content,
		...(message.tool_calls
			? {tool_calls: message.tool_calls as Message['tool_calls']}
			: {}),
	};
}

function configuredSocketPath(): string | null {
	return (
		process.env['AGENTIA_WYRMSTORE_SOCKET_PATH'] ??
		process.env['MEMD_SOCKET_PATH'] ??
		null
	);
}

function socketPath(): string | null {
	const configured = configuredSocketPath();
	if (configured) return configured;
	return fs.existsSync(DEFAULT_SOCKET_PATH) ? DEFAULT_SOCKET_PATH : null;
}

function topicId(): string {
	const configured = process.env['AGENTIA_WYRMSTORE_TOPIC_ID'];
	if (configured) return configured;

	const cwdName = path.basename(process.cwd());
	return `${TOPIC_PREFIX}-${cwdName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
}

function parseResponse(buffer: string): WyrmStoreResponse {
	const trimmed = buffer.trim();
	if (trimmed.startsWith('<<<BEGIN>>>')) {
		const json = trimmed
			.replace(/^<<<BEGIN>>>\s*/, '')
			.replace(/\s*<<<END>>>$/, '');
		return JSON.parse(json) as WyrmStoreResponse;
	}

	const [json] = trimmed.split('\n').filter(Boolean);
	if (!json) throw new Error('WyrmStore returned an empty response');
	return JSON.parse(json) as WyrmStoreResponse;
}

async function request(
	messages: Message[],
	socket: string,
): Promise<Message[]> {
	const payload: WyrmStoreRequest = {
		messages: messages
			.map(toWyrmStoreMessage)
			.flatMap(message => (message ? [message] : [])),
		memory_in: {
			topic_id: topicId(),
		},
	};

	log_to_file('chat.json', {wyrmstore_request: payload});

	return new Promise((resolve, reject) => {
		const client = createConnection(socket);
		let response = '';

		client.setEncoding('utf8');
		client.on('connect', () => {
			client.end(JSON.stringify(payload) + '\n');
		});
		client.on('data', chunk => {
			response += chunk;
		});
		client.on('end', () => {
			try {
				const parsed = parseResponse(response);
				log_to_file('chat.json', {wyrmstore_response: parsed});
				resolve(parsed.messages.map(toAgentMessage));
			} catch (error) {
				reject(error);
			}
		});
		client.on('error', reject);
	});
}

export async function enrichContext(messages: Message[]): Promise<Message[]> {
	const socket = socketPath();
	if (!socket) return messages;

	try {
		return await request(messages, socket);
	} catch (error) {
		if (configuredSocketPath()) throw error;
		log_to_file('errors.json', error);
		return messages;
	}
}
