import React, {useState, useEffect} from 'react';
import {render, Text, Box, Spacer} from 'ink';
import {TextInput} from '@inkjs/ui';
import process from 'node:process';
import Cowboy, {minCowboyWidth} from './cowboy';
import AgentProxy from './agents/index.js';

type Props = {
	name?: string;
};

const minContentWidth = 40;

export default function App({name = 'Stranger'}: Props) {
	const [reason, setReason] = useState('');
	const [content, setContent] = useState(`G'day ${name}`);
	const [error, setError] = useState('');
	const [query, setQuery] = useState(
		'Please return the results of this python script: `import random; print(random.randint(1, 6))`',
	);
	const [width, setWidth] = useState(process.stdout.columns);
	const [maxContent, setMaxContent] = useState(false);

	const agent = AgentProxy('http://localhost:8080/v1/chat/completions', {
		onResponseStart: () => setMaxContent(true),
		onReasonPart: setReason,
		onContentPart: setContent,
		onError: setError,
	});

	useEffect(() => {
		function onResize() {
			setWidth(process.stdout.columns);
		}

		process.stdout.on('resize', onResize);
		return () => {
			process.stdout.off('resize', onResize);
		};
	}, []);

	function submit() {
		setReason('...');
		setContent('...');
		setError('');
		agent.send([
			{
				role: 'user',
				content: query,
			},
		]);
	}

	let cowboy = <Spacer />;
	if (minContentWidth + minCowboyWidth < width) {
		let cowboyWidth = maxContent ? minCowboyWidth : width - minContentWidth;
		cowboy = <Cowboy width={cowboyWidth} />;
	}

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="green">
			<Box>
				{cowboy}
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
