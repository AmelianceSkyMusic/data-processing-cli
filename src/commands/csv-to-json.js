import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RESULT } from '../constants/result.js';
import { fileTransformPathPrepare } from '../helpers/file-transform-path-prepare.js';

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
	const path = await fileTransformPathPrepare(args);
	if (!path) return RESULT.invalidInput;

	const output = createWriteStream(path.outputPath);
	const input = createReadStream(path.inputPath);

	const transformStream = new CsvToJsonTransform();

	await pipeline(input, transformStream, output);

	return RESULT.ok;
}
