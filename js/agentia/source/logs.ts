import * as fs from 'fs';

const streams = new Map<string, fs.WriteStream>();
export function log_to_file<T>(filename: string, message: T): T {
	let log =
		streams.get(filename) ?? fs.createWriteStream(filename, {flags: 'a'});
	if (!streams.has(filename)) streams.set(filename, log);

	log.write(typeof message === 'string' ? message : JSON.stringify(message));
	log.write('\n');
	return message;
}
