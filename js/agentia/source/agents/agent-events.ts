import {EventEmitter} from 'node:events';
import {Message} from './index.js';

interface AgentEvents {
	responseStart: [];
	responseEnd: [finish_reason: string];
	reasonPart: [reason: string];
	contentPart: [content: string];
	toolResponse: [messages: Message[]];
	error: [error: string];
	toolCall: [message: Message]; // => Promise<void>;
}

export type AgentEventListener = {
	[K in keyof AgentEvents]: [K, (...args: AgentEvents[K]) => void];
}[keyof AgentEvents];

export type AgentEventListeners = AgentEventListener[];

export class AgentEventEmitter {
	private events = new EventEmitter();

	on<K extends keyof AgentEvents>(
		signal: K,
		listener: (...args: AgentEvents[K]) => void,
	): void {
		this.events.on(signal, listener as (...args: any[]) => void);
	}

	all(listeners: AgentEventListeners) {
		listeners.forEach(
			([signal, listener]) => listener && this.events.on(signal, listener),
		);
	}

	emit<K extends keyof AgentEvents>(
		signal: K,
		...args: AgentEvents[K]
	): boolean {
		return this.events.emit(signal, ...args);
	}

	off<K extends keyof AgentEvents>(
		signal: K,
		listener: (...args: AgentEvents[K]) => void,
	): void {
		this.events.off(signal, listener as (...args: any[]) => void);
	}
}
