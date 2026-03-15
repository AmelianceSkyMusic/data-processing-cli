import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RESULT } from '../constants/result.js';
import { store } from '../store/store.js';
import { checkIsFileExists } from '../utils/check-is-file-exists.js';
import { checkIsFolderExists } from '../utils/check-is-folder-exists.js';
import { pathResolver } from '../utils/path-resolver.js';

export async function csvToJson(args) {
	const { file: inputPath } = await pathResolver(store.currentDir, args.input);
	const { file: outputPath } = await pathResolver(store.currentDir, args.output);

	if (!inputPath || !outputPath) return RESULT.invalidInput;

	const isInputFileExists = await checkIsFileExists(inputPath);
	if (!isInputFileExists) return RESULT.invalidInput;

	const outputPathDir = path.dirname(outputPath);
	const isOutputDirExists = await checkIsFolderExists(outputPathDir);
	if (!isOutputDirExists) {
		await mkdir(outputPathDir, { recursive: true });
	}

	const output = createWriteStream(outputPath);
	const input = createReadStream(inputPath);

	let headerKeys = null;
	let buffer = '';
	let isFirstLine = true;

	const pushLines = (stream, lines) => {
		lines.forEach((line) => {
			if (!line) return;
			if (!isFirstLine) {
				stream.push(',\n');
			} else {
				isFirstLine = false;
			}

			stream.push(`\t{ `);
			const values = line.split(',');
			values.forEach((value, index) => {
				if (index > 0) stream.push(', ');
				stream.push(`"${headerKeys[index]}": "${value}"`);
			});
			stream.push(` }`);
		});
	};

	const transformStream = new Transform({
		transform(chunk, encoding, callback) {
			const text = String(chunk);

			buffer = buffer + text;

			const lines = buffer.split('\n');
			if (!headerKeys && lines.length > 0) {
				headerKeys = lines.shift().split(',');
				this.push(`[\n`);
			}

			buffer = lines.pop();

			pushLines(this, lines);

			callback();
		},
		flush(callback) {
			const lines = buffer.split('\n');

			pushLines(this, lines);
			this.push(`\n]\n`);

			headerKeys = null;
			buffer = '';
			callback();
		},
	});

	await pipeline(input, transformStream, output);

	return RESULT.ok;
}
