import {promisify} from 'node:util';
import {exec} from 'child_process';

export const execPromise = promisify(exec);

export interface ExecPromise {
	stdout: string;
	stderr: string;
}

export interface Tool {
	name: string;
	description: string;
	parameters: [Parameter];
	requiredParameters: [string];
	call: (obj: any) => ExecPromise;
}

export interface Parameter {
	name: string;
	type: string;
	description: string;
}

export interface ToolDescription {
	type: string;
	function: {
		name: string;
		description: string;
		parameters: {
			type: string;
			required: string[];
			properties: {
				[name: string]: {
					type: string;
					description: string;
				};
			};
		};
	};
}

export function toolJson(tool: Tool): ToolDescription {
	return {
		type: 'function',
		function: {
			name: tool.name,
			description: tool.description,
			parameters: {
				type: 'object',
				required: tool.requiredParameters,
				properties: Object.fromEntries(
					tool.parameters.map(({name, type, description}) => [
						name,
						{type, description},
					]),
				),
			},
		},
	};
}
