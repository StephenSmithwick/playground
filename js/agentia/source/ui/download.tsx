#!/usr/bin/env node

import React, {useState, useEffect} from 'react';
import {EventEmitter} from 'node:events';
import {render, Text, Box} from 'ink';
import {exec, execSync} from 'node:child_process';
import {modelMap} from '../models.js';
import {Loader} from './loader.js';
import {promisify} from 'node:util';

const execPromise = promisify(exec);

const events = new EventEmitter();
const cache = execSync('llama-cli -cl 2> /dev/null').toString();

interface Model {
	name: string;
	id: string;
	status: 'present' | 'missing' | 'downloading';
}

function toModel([name, id]: [string, string]): Model {
	const status = cache.includes(id) ? 'present' : 'missing';
	return {name, id, status};
}

function renderStatus(status: Model['status']): React.JSX.Element {
	if (status === 'present') return <Text color={'greenBright'}>✔</Text>;
	if (status === 'missing') return <Text color={'redBright'}>✘</Text>;
	return <Loader />;
}

function ModelDownloader(props: Model) {
	const [status, setStatus] = useState<Model['status']>(props.status);

	useEffect(() => {
		events.on(props.id, setStatus);
		return () => {
			events.off(props.id, setStatus);
		};
	}, [props.id]);

	return (
		<Box key={props.id} flexDirection="row" gap={1}>
			<Text>‣</Text>
			<Text color={'blue'}>{props.name.padEnd(12)}</Text>
			<Text>{props.id.padEnd(50)}</Text>
			{renderStatus(status)}
		</Box>
	);
}

function Downloader() {
	const models = Object.entries(modelMap).map(toModel);

	useEffect(() => {
		async function downloadModels() {
			for (const model of models.filter(m => m.status === 'missing')) {
				events.emit(model.id, 'downloading');
				await execPromise(`echo "/exit" | llama-cli -hf ${model.id}`);
				events.emit(model.id, 'present');
			}
		}
		downloadModels();
	}, []);

	return (
		<Box flexDirection="column">
			{models.map(model => (
				<ModelDownloader key={model.id} {...model} />
			))}
		</Box>
	);
}

render(<Downloader />);
