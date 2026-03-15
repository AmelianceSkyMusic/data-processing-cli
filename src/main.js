import readline from 'node:readline';
import { handleClose } from './cli/handle-close.js';
import { initApp } from './cli/init-app.js';
import { logResult } from './cli/log-result.js';
import { COMMAND } from './constants/command.js';
import { RESULT } from './constants/result.js';
import { repl } from './repl.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

export function main() {
	initApp(rl);

	rl.on('line', async (line) => {
		const input = line.trim();
		if (!input) return logResult(rl, RESULT.invalidInput);

		if (input === COMMAND.exit) return rl.close();

		const result = await repl(input);
		logResult(rl, result);
	});

	handleClose(rl);
}

main();
