import React from 'react';
import {Text} from 'ink';
import {TextInput} from '@inkjs/ui';
import {Loader} from './loader.js';

type Props = {
	loading: boolean;
	query: string;
	onChange?: ((value: string) => void) | undefined;
	onSubmit?: ((value: string) => void) | undefined;
};

export function ChatInput(props: Props) {
	const {loading, query} = props;
	return (
		<>
			<Text color="whiteBright" bold={true}>
				{props.loading ? <Loader /> : 'Enter your query: '}
			</Text>
			<TextInput
				{...props}
				isDisabled={loading}
				placeholder={loading ? 'Model Loading' : query}
			/>
		</>
	);
}
