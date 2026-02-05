interface ChoiceDelta {
	role?: string;
	reasoning_content?: string;
	content?: string;
}

interface StreamChunk {
	choices: {
		finish_reason?: string;
		delta: ChoiceDelta;
	}[];
}

export interface ModelSettings {
	url: string;

	onResponseStart?: () => void;
	onReasonPart?: (response: string) => void;
	onContentPart?: (response: string) => void;
	onError?: (error: string) => void;
}

export interface Model {
	talk: (query: string) => Promise<void>;
}

export default function Model(settings: ModelSettings): Model {
	return {
		talk: async function (query: string) {
			try {
				const res = await fetch(settings.url, {
					method: 'POST',
					body: JSON.stringify({
						messages: [{role: 'user', content: query}],
						stream: true,
					}),
				});

				if (!res.body) throw new Error('Response body missing.');

				const decoder = new TextDecoder();
				let reasonBuf = '';
				let contentBuf = '';

				for await (const chunk of res.body) {
					settings.onResponseStart?.();
					const lines = decoder
						.decode(chunk, {stream: true})
						.replace(/^data:\s*/gm, '')
						.replace(/\[DONE\]/g, '')
						.split('\n')
						.filter(line => line.trim() !== '');

					for (const line of lines) {
						let data: StreamChunk;
						try {
							data = JSON.parse(line);
						} catch {
							settings.onError?.(`Unable to parse: ${line}`);
							continue;
						}

						for (const choice of data.choices) {
							if (choice.delta.reasoning_content) {
								reasonBuf += choice.delta.reasoning_content;
								settings.onReasonPart?.(reasonBuf);
							}
							if (choice.delta.content) {
								contentBuf += choice.delta.content;
								settings.onContentPart?.(contentBuf);
							}
						}
					}
				}
			} catch (err: unknown) {
				settings.onError?.(`Request failed: ${(err as Error).message}`);
			}
		},
	};
}
