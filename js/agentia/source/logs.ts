import * as fs from 'fs';
import * as path from 'path';
import {finished} from 'node:stream/promises';

const streams = new Map<string, fs.WriteStream>();
const LOG_DIR = path.resolve(process.cwd(), 'logs');

fs.mkdirSync(LOG_DIR, {recursive: true});

function formatMessage<T>(value: T): string {
	if (typeof value === 'string') return value;
	if (Error.isError(value))
		return JSON.stringify({message: value.message, stack: value.stack});
	return JSON.stringify(value);
}

export function log_to_file<T>(filename: string, value: T): T {
	let log = streams.get(filename);
	if (!log) {
		streams.set(
			filename,
			(log = fs.createWriteStream(path.join(LOG_DIR, filename), {flags: 'a'})),
		);
	}
	log.write(formatMessage(value) + '\n');
	return value;
}

async function endStream(stream: fs.WriteStream): Promise<void> {
	stream.end(`{ "process_end": ${process.pid}, "timestamp": ${Date.now()}}\n`);
	return finished(stream);
}

async function shutdown(exitCode: number) {
	const watchdog = setTimeout(() => process.exit(1), 10000).unref();

	try {
		await Promise.allSettled([...streams.values()].map(endStream));
	} finally {
		clearTimeout(watchdog);
		process.exit(exitCode);
	}
}

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal =>
	process.on(signal, () => shutdown(0)),
);
['uncaughtException', 'unhandledRejection'].forEach(event =>
	process.on(event, e => {
		log_to_file('errors.json', e);
		console.error(e);
		shutdown(1);
	}),
);
