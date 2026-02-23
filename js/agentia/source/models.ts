import {spawn} from 'child_process';
import {log_to_file} from './logs.js';

const LOCAL = 'http://localhost:8080';
const CHAT_URL = `${LOCAL}/v1/chat/completions`;
const HEALTH_URL = `${LOCAL}/v1/health`;
const MODEL_URL = `${LOCAL}/v1/models`;
const LOAD_URL = `${LOCAL}/v1/models/load`;
const UNLOAD_URL = `${LOCAL}/v1/models/unload`;

export interface Model {
	id: string;
	context: number;

	chat: (body: any) => Promise<Response>;
	load: () => Promise<Response>;
	unload: () => Promise<Response>;
}

async function serverIsDown() {
	try {
		const health = await fetch(HEALTH_URL);

		if (!health.ok) {
			return true;
		}

		const healthData = await health.json();

		return healthData.status !== 'ok';
	} catch (error) {
		return true;
	}
}

interface FetchModel {
	id: string;
	status?: {
		args: string[];
	};
}

async function fetchModels(): Promise<{data: FetchModel[]}> {
	try {
		const res = await fetch(MODEL_URL);
		return await res.json();
	} catch (error) {
		log_to_file('errors.json', error);
		return Promise.reject('Unable to load local server models');
	}
}

const watchdog = setTimeout(() => {
	throw new Error('Unable to startup llama-server');
}, 5000);
if (await serverIsDown()) {
	console.log('Starting llama-server');
	spawn('llama-server', ['--models-preset', './models.ini']);
	while (await serverIsDown()) {}
}
clearTimeout(watchdog);

const allModels = (await fetchModels())['data'];
log_to_file('models.json', allModels);

async function LocalLLM(model: string): Promise<Model> {
	const modelData = allModels.find(({id}) => id === model);
	if (!modelData) return Promise.reject(`No matching model found: ${model}`);
	if (!modelData.status)
		return Promise.reject(
			`llama-server ${model}: status missing (Have you started llama-server per the README.md?)`,
		);
	const ctxId = modelData.status.args.findIndex(
		(arg: string) => arg === '--ctx-size',
	);
	const context = Number(modelData.status.args[ctxId + 1]);

	function chat(body: any): Promise<Response> {
		const message = JSON.stringify({...body, model});
		log_to_file('request.json', message);
		return fetch(CHAT_URL, {method: 'POST', body: message});
	}

	function load(): Promise<Response> {
		const message = JSON.stringify({model});
		log_to_file('load.json', {load: message});
		return fetch(LOAD_URL, {method: 'POST', body: message});
	}

	function unload(): Promise<Response> {
		const message = JSON.stringify({model});
		log_to_file('load.json', {load: message});
		return fetch(UNLOAD_URL, {method: 'POST', body: message});
	}

	return {id: model, context, chat, load, unload};
}

export const smallLLM = await LocalLLM('unsloth/Qwen3-0.6B-GGUF');
export const mediumLLM = await LocalLLM('unsloth/Qwen3-1.7B-GGUF');
export const largeLLM = await LocalLLM('unsloth/Qwen3-14B-GGUF');
