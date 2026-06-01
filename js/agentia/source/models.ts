import {spawn, ChildProcess} from 'child_process';
import {log_to_file} from './logs.js';

const SERVER_TIMEOUT = 5000;
const LOCAL = 'http://localhost:8080';
const CHAT_URL = `${LOCAL}/v1/chat/completions`;
const HEALTH_URL = `${LOCAL}/v1/health`;
const MODEL_URL = `${LOCAL}/v1/models`;
const LOAD_URL = `${LOCAL}/v1/models/load`;
const UNLOAD_URL = `${LOCAL}/v1/models/unload`;

export interface Model {
	id: string;

	chat: (body: any) => Promise<Response>;
	load: () => Promise<Response>;
	unload: () => Promise<Response>;
}

export interface ServerHealth {
	status: string;
}

async function serverIsDown() {
	try {
		const health = await fetch(HEALTH_URL);

		if (!health.ok) {
			return true;
		}

		const healthData = (await health.json()) as ServerHealth;
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

async function fetchModels(): Promise<FetchModel[]> {
	const res = await fetch(MODEL_URL);
	const responseData = (await res.json()) as {data: FetchModel[]};
	return responseData.data;
}

let serverProcess: ChildProcess | null = null;
async function startLLMServer() {
	if (serverProcess) return;

	const watchdog = setTimeout(() => {
		throw new Error('Unable to startup llama-server');
	}, SERVER_TIMEOUT);

	if (await serverIsDown()) {
		serverProcess = spawn('llama-server', ['--models-preset', './models.ini'], {
			cwd: process.cwd(),
			env: process.env,
		});
		do {
			await new Promise(r => setTimeout(r, SERVER_TIMEOUT / 10 - 1));
		} while (await serverIsDown());
	}

	function cleanup() {
		if (!serverProcess) return;
		serverProcess.kill('SIGINT');
		serverProcess = null;
	}

	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);
	process.on('exit', cleanup);
	clearTimeout(watchdog);
}

async function LocalLLM(
	model: string,
	modelInformation: FetchModel[],
): Promise<Model> {
	const modelData = modelInformation.find(({id}) => id === model);
	if (!modelData) throw new Error(`Model not found in cache: ${model}`);

	function chat(body: any): Promise<Response> {
		const request = {...body, model};
		log_to_file('chat.json', {request});
		return fetch(CHAT_URL, {method: 'POST', body: JSON.stringify(request)});
	}

	function load(): Promise<Response> {
		return fetch(LOAD_URL, {method: 'POST', body: JSON.stringify({model})});
	}

	function unload(): Promise<Response> {
		return fetch(UNLOAD_URL, {method: 'POST', body: JSON.stringify({model})});
	}

	return {id: model, chat, load, unload};
}

export const modelMap = {
	smallLLM: 'unsloth/Qwen3-0.6B-GGUF',
	mediumLLM: 'unsloth/Qwen3-1.7B-GGUF',
	largeLLM: 'unsloth/Qwen3-14B-GGUF',
	visionLLM: 'stduhpf/google-gemma-3-4b',
} as const;
export type ModelKey = keyof typeof modelMap;
export async function loadLocalModel(model: ModelKey): Promise<Model> {
	await startLLMServer();

	const modelInformation = await fetchModels();

	return await LocalLLM(modelMap[model], modelInformation);
}
