const ARG_PREFIX = '--';
const QUOTES_REG_EXP = /"([^"]*)"|'([^']*)'|([^\s"']+)/g;
const QUOTES_REPLACE_REG_EXP = /^["']|["']$/g;

export function argParser(line) {
	const preparedLine = line.trim();
	if (!preparedLine) return { command: null, args: {}, argsList: [], argsLine: '' };

	const firstSpaceIndex = preparedLine.indexOf(' ');
	if (firstSpaceIndex === -1) {
		return { command: preparedLine, args: {}, argsList: [], argsLine: '' };
	}

	const command = preparedLine.slice(0, firstSpaceIndex);
	const argsLine = preparedLine.slice(firstSpaceIndex).trim();

	const matches = argsLine.match(QUOTES_REG_EXP);

	const argsList = matches?.map((arg) => arg.replace(QUOTES_REPLACE_REG_EXP, '')) || [];

	const args = {};
	for (let i = 0; i < argsList.length; i++) {
		const parameter = argsList[i];
		if (parameter.startsWith(ARG_PREFIX)) {
			const key = parameter.slice(ARG_PREFIX.length);
			const value = argsList[i + 1];

			if (value && !value.startsWith(ARG_PREFIX)) {
				args[key] = value;
				i++;
			} else {
				args[key] = true;
			}
		}
	}

	return { command: command.trim(), args, argsList, argsLine };
}
