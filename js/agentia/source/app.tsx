import React, {useState, useEffect} from 'react';
import {render, Text, Box, Spacer} from 'ink';
import {TextInput} from '@inkjs/ui';
import process from 'node:process';
import Cowboy, {minCowboyWidth} from './cowboy.js';
import ProxyAgent from './agents/proxy-agent.js';
import {Agent} from './agents/index.js';
import {AgentEventListeners} from './agents/agent-events.js';
import {Spinner} from './spinner.js';

type Props = {
	name?: string;
};

const minContentWidth = 40;

export default function App({name = 'Stranger'}: Props) {
	const [agent, setAgent] = useState<Agent | null>(null);
	const [loading, setLoading] = useState(true);

	const [reason, setReason] = useState<string | null>('');
	const [content, setContent] = useState<string | null>(`G'day ${name}`);
	const [error, setError] = useState('');
	const [query, setQuery] = useState(
		'Please return the results of this python script: `import random; print(random.randint(1, 6))`',
	);
	const [width, setWidth] = useState(process.stdout.columns);
	const [maxContent, setMaxContent] = useState(false);

	const listeners: AgentEventListeners = [
		['responseStart', () => setMaxContent(true)],
		['reasonPart', setReason],
		['contentPart', setContent],
		['error', setError],
	];

	useEffect(() => {
		function onResize() {
			setWidth(process.stdout.columns);
		}
		process.stdout.on('resize', onResize);
		return () => {
			process.stdout.off('resize', onResize);
		};
	}, []);

	useEffect(() => {
		async function loadModel() {
			try {
				setAgent(await ProxyAgent(listeners));
				setLoading(false);
			} catch (error) {
				if (error instanceof Error)
					setError(`Error loading model: ${error.message}`);
			}
		}
		loadModel();
	}, []);

	function submit() {
		setReason(null);
		setContent(null);
		setError('');
		agent?.send([
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
					<Text color="blue">{reason ?? <Spinner />}</Text>
					<Text color="green">{content ?? <Spinner />}</Text>
					{error && <Text color="red">{error}</Text>}
				</Box>
			</Box>
			<Text>
				<Text color="whiteBright" bold={true}>
					{loading ? <Spinner /> : 'Enter your query: '}
				</Text>
				<TextInput
					isDisabled={loading}
					placeholder={loading ? 'Model Loading' : query}
					onChange={setQuery}
					onSubmit={submit}
				/>
			</Text>
		</Box>
	);
}
