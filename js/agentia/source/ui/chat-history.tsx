import {Text, Box} from 'ink';
import React from 'react';
import {Loader} from './loader.js';

export type ChatItem = {
	query: string | null;
	reason: string | null;
	content: string | null;
};

type Props = {
	reason: string | null;
	content: string | null;
	error: string | null;
	history: ChatItem[];
};

export function ChatHistory({reason, content, error, history}: Props) {
	return (
		<>
			{history.map((item, i) => (
				<Box key={i}>
					{item.query && <Text>{item.query}</Text>}
					{item.reason && <Text color="blue">{reason}</Text>}
					{item.content && <Text color="green">{content}</Text>}
				</Box>
			))}
			<Text color="blue">{reason ?? <Loader />}</Text>
			<Text color="green">{content ?? <Loader />}</Text>
			{error && <Text color="red">{error}</Text>}
		</>
	);
}
