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

class CsvToJsonTransform extends Transform {
	constructor() {
		super();
		this.headerKeys = null;
		this.buffer = '';
		this.isFirstLine = true;
	}

	pushLines(lines) {
		lines.forEach((line) => {
			if (!line) return;
			if (!this.isFirstLine) {
				this.push(',\n');
			} else {
				this.isFirstLine = false;
			}

			this.push(`\t{ `);
			const values = line.split(',');
			values.forEach((value, index) => {
				if (index > 0) this.push(', ');
				this.push(`"${this.headerKeys[index]}": "${value}"`);
			});
			this.push(` }`);
		});
	}

	_transform(chunk, encoding, callback) {
		const text = String(chunk);

		this.buffer = this.buffer + text;

		const lines = this.buffer.split('\n');
		if (!this.headerKeys && lines.length > 0) {
			this.headerKeys = lines.shift().split(',');
			this.push(`[\n`);
		}

		this.buffer = lines.pop();

		this.pushLines(lines);

		callback();
	}

	_flush(callback) {
		const lines = this.buffer.split('\n');

		this.pushLines(lines);
		this.push(`\n]\n`);

		this.headerKeys = null;
		this.buffer = '';
		callback();
	}
}

export async function csvToJson(args) {
	if (args.input === undefined || args.output === undefined) return RESULT.invalidInput;

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

	const transformStream = new CsvToJsonTransform();

	await pipeline(input, transformStream, output);

	return RESULT.ok;
}
