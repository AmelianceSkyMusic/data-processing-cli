import { createReadStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { RESULT } from '../constants/result.js';
import { store } from '../store/store.js';
import { pathResolver } from '../utils/path-resolver.js';

class JsonToCsvTransform extends Transform {
	constructor() {
		super();
		this.buffer = '';
	}

	_transform(chunk, encoding, callback) {
		const text = String(chunk);

		this.buffer = this.buffer + text;

		callback();
	}

	_flush(callback) {
		const lines = this.buffer.split('\n');
		console.log('Lines: ', lines.length);
		const words = this.buffer.replaceAll('\n', ' ').split(' ');
		console.log('Words: ', words.length);
		const characters = this.buffer.length;
		console.log('Characters: ', characters);

		callback();
	}
}

export async function count(args) {
	if (args.input === undefined) return RESULT.invalidInput;

	const { isFileExists, resolvedPath: inputPath } = await pathResolver(
		store.currentDir,
		args.input,
	);

	if (!isFileExists) return RESULT.operationFailed;

	const input = createReadStream(inputPath);

	const transformStream = new JsonToCsvTransform();

	await pipeline(input, transformStream);

	return RESULT.ok;
}
