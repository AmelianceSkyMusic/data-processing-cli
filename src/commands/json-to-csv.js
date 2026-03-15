import { createReadStream, createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RESULT } from '../constants/result.js';
import { fileTransformPathPrepare } from '../helpers/file-transform-path-prepare.js';

class JsonToCsvTransform extends Transform {
	constructor() {
		super();
		this.headerKeys = null;
		this.buffer = '';
	}

	pushLines(lines) {
		lines.forEach((line) => {
			if (!line || line.startsWith('[') || line.startsWith(']')) return;
			const preparedLine = line.trim().replace('},', '}');
			const values = JSON.parse(preparedLine);
			if (!this.headerKeys) {
				this.headerKeys = Object.keys(values);
				this.push(`${this.headerKeys.join(',')}\n`);
			}

			const valuesString = this.headerKeys
				.map((key) => {
					return values[key];
				})
				.join(',');

			this.push(`${valuesString}\n`);
		});
	}

	_transform(chunk, encoding, callback) {
		const text = String(chunk);

		this.buffer = this.buffer + text;

		const lines = this.buffer.split('\n');

		this.buffer = lines.pop();

		this.pushLines(lines);

		callback();
	}

	_flush(callback) {
		const lines = this.buffer.split('\n');

		this.pushLines(lines);

		this.headerKeys = null;
		this.buffer = '';

		callback();
	}
}

export async function jsonToCsv(args) {
	const path = await fileTransformPathPrepare(args);
	if (!path) return RESULT.invalidInput;

	const output = createWriteStream(path.outputPath);
	const input = createReadStream(path.inputPath);

	const transformStream = new JsonToCsvTransform();

	await pipeline(input, transformStream, output);

	return RESULT.ok;
}
