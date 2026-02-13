import {Tool, execPromise, ExecPromise} from './index';

const image = 'python:3-alpine';

const Python = (): Tool => ({
	name: 'Python',
	description: 'Execute Python script',
	parameters: [
		{
			name: 'script',
			type: 'string',
			description: 'A python3 script to execute',
		},
	],
	requiredParameters: ['script'],
	call: function ({script}: any): ExecPromise {
		if (typeof script !== 'string') return Promise.reject('No script provided');

		const docker = execPromise(`docker run -i --rm ${image} python -`);
		docker.child.stdin?.write(script);
		docker.child.stdin?.end();
		return docker;
	},
});

export default Python;
