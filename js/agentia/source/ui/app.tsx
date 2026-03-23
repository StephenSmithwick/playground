import React, {useState, useEffect} from 'react';
import {Text, Box, Spacer} from 'ink';
import process from 'node:process';
import Cowboy, {minCowboyWidth} from './cowboy.js';
import ProxyAgent from '../agents/proxy-agent.js';
import {Agent} from '../agents/index.js';
import {AgentEventListeners} from '../agents/agent-events.js';
import {ChatHistory, ChatItem} from './chat-history.js';
import {ChatInput} from './chat-input.js';

type Props = {
	name?: string;
};

const minContentWidth = 40;

export default function App({name = 'Stranger'}: Props) {
	const [agent, setAgent] = useState<Agent | null>(null);
	const [loading, setLoading] = useState(true);

	const [history, setHistory] = useState<ChatItem[]>([]);
	const [reason, setReason] = useState<string | null>('');
	const [content, setContent] = useState<string | null>(`G'day ${name}`);
	const [error, setError] = useState('');
	const [query, setQuery] = useState('');
	const [width, setWidth] = useState(process.stdout.columns);
	const [maxContent, setMaxContent] = useState(false);

	const listeners: AgentEventListeners = [
		['responseStart', () => setMaxContent(true)],
		['reasonPart', setReason],
		[
			'contentPart',
			(content: string) => {
				if (!reason) setReason('');
				setContent(content);
			},
		],
		['responseEnd', () => setHistory([{query, reason, content}, ...history])],
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
				const proxyAgent = await ProxyAgent(listeners);
				setAgent(proxyAgent);
				setQuery(proxyAgent.suggest());
				setLoading(false);
			} catch (error) {
				if (error instanceof Error) setError(error.message);
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
					<ChatHistory
						reason={reason}
						content={content}
						error={error}
						history={history}
					/>
				</Box>
			</Box>
			<Text>
				<ChatInput
					loading={loading}
					onChange={setQuery}
					onSubmit={submit}
					query={query}
				/>
			</Text>
		</Box>
	);
}
