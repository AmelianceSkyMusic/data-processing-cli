import { csvToJson } from './commands/csv-to-json.js';
import { COMMAND } from './constants/command.js';
import { RESULT } from './constants/result.js';
import { navigation } from './navigation.js';
import { argParser } from './utils/arg-parser.js';
import { getMatch } from './utils/get-match.js';

export async function repl(line) {
	const { command, args, argsList, argsLine } = argParser(line);

	if (!command) return RESULT.invalidInput;

	const doAction = getMatch(command, {
		[COMMAND.up]: () => navigation.up(argsList),
		[COMMAND.cd]: () => navigation.cd(argsLine),
		[COMMAND.ls]: () => navigation.ls(argsList),
		[COMMAND.csvToJson]: () => csvToJson(args),
		[COMMAND.jsonToCsv]: () => jsonToCsv(args),
	});

	if (!doAction || typeof doAction !== 'function') return RESULT.invalidInput;

	return await doAction();
}
