import React, {useState} from 'react';
import {render, Text, Box, Newline} from 'ink';
import TextInput from 'ink-text-input';

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
	const [reason, setReason] = useState('...');
	const [content, setContent] = useState('...');
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
				const text = decoder
					.decode(chunk, {stream: true})
					.replace(/^data:\s*/gm, '')
					.replace(/\[DONE\]/g, '')
					.trim();

				if (!text) continue;

				let data: StreamChunk;
				try {
					data = JSON.parse(text);
				} catch {
					continue; // Skip malformed chunks
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
		<Box flexDirection="column" borderStyle="doubleSingle" borderColor="green">
			<Box>
				<Text color="blackBright" backgroundColor="redBright">
					{cowboy}
				</Text>
				<Text>
					<Newline /> <Newline /> Howdy {name}
				</Text>
			</Box>
			<Text color="blue">{reason}</Text>
			<Text color="green">{content}</Text>
			{error && <Text color="red">{error}</Text>}
			<Box>
				<Box marginRight={1}>
					<Text color="whiteBright" bold={true}>
						Enter your query:
					</Text>
				</Box>

				<TextInput value={query} onChange={setQuery} onSubmit={submit} />
			</Box>
		</Box>
	);
}

const cowboy = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⣀⢠⣶⣶⡄⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣾⣤⣾⠀⠀⠀⠀⠀⠀⠙⢻⣿⣿⡟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⣤⠄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⣴⣾⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣀⠀⢀⣴⣾⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠉⠻⣿⣿⡇⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠀⠀⠀⣹⡛⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢲⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡯⣉⣉⡈⠥⠂⠀⠀⠀⢼⣿⣧⣹⣿⣿⣿⣿⣿⡇⢹⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⣼⣿⣿⣿⣿⣿⣿⣗⣾⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⢸⣷⣿⣿⣿⣿⢿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠋⢻⣿⣿⣿⢸⣿⣿⣿⢻⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⡟⣿⣿⣿⠟⠘⠀⠀⠈⠉⠉⢹⣿⣿⠃⢹⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⢸⣿⣿⡿⢸⣸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⢿⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣻⣿⡇⠘⣿⣿⢫⡸⣻⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠉⢸⣿⣿⣿⣿⣏⠁⠀⠀⡀⠀⠀⠀⠀⢀⣿⢧⠀⢸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣻⣿⡇⠀⣿⡿⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣹⡿⣿⣿⠀⢀⣰⣧⣤⣠⣶⣀⣾⣙⣘⣶⣾⣇⣤⣲⣿⣾⣴⣶⣄⠀⡠⠀⣈⡆⣠⣄⣹⣿⣃⣀⣿⣡⣆⣦⣄⣔⠀⣀⢠⠀⠄⣴⣀⣰⣿⣾⣶⣦⡀
⠀⠀⠀⣤⢀⣾⣿⣿⣾⣿⣷⣼⣶⣿⣿⣿⣷⣿⣿⣾⣿⣿⣿⣿⣿⣤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣿⣶⣴⣿⣿⣿⣿⣿⣿⣿⣿
⣶⣾⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
`;

render(<App />);
