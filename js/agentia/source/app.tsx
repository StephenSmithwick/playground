import React, {useState, useEffect} from 'react';
import {render, Text, Box, Newline} from 'ink';

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

	useEffect(() => {
		async function talkToModel() {
			try {
				const res = await fetch('http://localhost:8080/v1/chat/completions', {
					method: 'POST',
					body: JSON.stringify({
						messages: [{role: 'user', content: 'Why is the sky blue?'}],
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

		talkToModel();
	}, []);

	return (
		<Box flexDirection="column">
			<Box>
				<Text>{cowboy}</Text>
				<Text>
					<Newline />
					<Newline />
					Howdy {name}
				</Text>
			</Box>
			<Text color="blue">{reason}</Text>
			<Text color="green">{content}</Text>
			{error && <Text color="red">{error}</Text>}
		</Box>
	);
}

const cowboy = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣲⡂⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⣀⢠⣶⣶⡄⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣶⣭⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣾⣤⣾⠀⠀⠀⠀⠀⠀⠙⢻⣿⣿⡟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⠁⠀⠀⠀⣠⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣶⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⣠⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣀⣀⣻⣿⣿⡅⠀⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⣤⠄⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⣴⣾⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⡇⠀⠐⠒⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣀⠀⢀⣴⣾⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣇⣀⣀⣀⠀⠀⠀⠀⠀⣀⣤⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠉⠻⣿⣿⡇⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠀⠀⠀⣰⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠀⠀⠀⣹⡛⠀⠀⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⠀⠀⢲⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡯⠀⣉⡈⠥⠂⠀⠀⠀⢼⣿⣧⣹⣿⣿⣿⣿⣿⡇⢹⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡌⠉⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⡿⣼⣿⣿⣿⣿⣿⣿⣗⣾⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⢸⣷⣿⣿⣿⣿⢿⣿⣿⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠋⢻⣿⣿⣿⢸⣿⣿⣿⢻⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣴⣿⣿⣿⡟⣿⣿⣿⠟⠘⠀⠀⠈⠉⠉⢹⣿⣿⠃⢹⣿⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⢸⣿⣿⡿⢸⣸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠻⡟⣿⣿⣿⣿⣿⠟⠉⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⠀⢸⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣻⣿⡇⠘⣿⣿⢫⡸⣻⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀
⠀⠀⠀⠉⠙⠃⠿⠀⠀⣈⠉⠉⠉⢸⣿⣿⣿⣿⣏⠁⠀⠀⡀⠀⠀⠀⠀⢀⣿⢧⠀⢸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣻⣿⡇⠀⣿⡿⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀⠀⠀
⠀⠀⡀⠸⠀⣦⣰⡀⢀⣏⡀⢀⠀⢸⣿⣹⡿⣿⣿⠀⢀⣰⣧⣤⣠⣶⣀⣾⣙⣘⣶⣾⣇⣤⣲⣿⣾⣴⣶⣄⠀⡠⠀⣈⡆⣠⣄⣹⣿⣃⣀⣿⣡⣆⣦⣄⣔⠀⣀⢠⠀⠄⣴⣀⣰⣿⣾⣶⣶⣶
⠀⠀⣿⣤⢀⣾⣿⣿⣾⣿⣷⣼⣶⣿⣿⣿⣷⣿⣿⣾⣿⣿⣿⣿⣿⣤⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣿⣶⣴⣿⣿⣿⣿⣿⣿⣿⣿
⣶⣾⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
`;

render(<App />);
