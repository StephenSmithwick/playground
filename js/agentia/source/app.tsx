import React, {useState} from 'react';
import {render, Text, Box} from 'ink';
import {TextInput} from '@inkjs/ui';
import Cowboy from './cowboy.js';

type Props = {
	name?: string;
};

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

export default function App({name = 'Stranger'}: Props) {
	const [reason, setReason] = useState('');
	const [content, setContent] = useState(`G'day ${name}`);
	const [error, setError] = useState('');
	const [query, setQuery] = useState('Why is the sky blue?');

	async function talkToModel(query: string) {
		try {
			const res = await fetch('http://localhost:8080/v1/chat/completions', {
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
						setError(`Unable to parse: ${line}`);
						continue;
					}

					for (const choice of data.choices) {
						if (choice.delta.reasoning_content) {
							reasonBuf += choice.delta.reasoning_content;
							setReason(reasonBuf);
						}
						if (choice.delta.content) {
							contentBuf += choice.delta.content;
							setContent(contentBuf);
						}
					}
				}
			}
		} catch (err: unknown) {
			setError(`Request failed: ${(err as Error).message}`);
		}
	}

	function submit() {
		setReason('...');
		setContent('...');
		setError('');
		talkToModel(query);
	}

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="green">
			<Box>
				<Cowboy />
				<Box flexDirection="column" marginLeft={1} flexGrow={1}>
					<Text color="blue">{reason}</Text>
					<Text color="green">{content}</Text>
					{error && <Text color="red">{error}</Text>}
				</Box>
			</Box>
			<Text>
				<Text color="whiteBright" bold={true}>
					Enter your query:{' '}
				</Text>
				<TextInput placeholder={query} onChange={setQuery} onSubmit={submit} />
			</Text>
		</Box>
	);
}

render(<App />);
