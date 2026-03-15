import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { store } from '../store/store.js';
import { checkIsFolderExists } from '../utils/check-is-folder-exists.js';
import { pathResolver } from '../utils/path-resolver.js';

export async function fileTransformPathPrepare(args) {
	if (args.input === undefined || args.output === undefined) return null;

	const { isFileExists, resolvedPath: inputPath } = await pathResolver(
		store.currentDir,
		args.input,
	);
	if (!isFileExists) return null;

	const { resolvedPath: outputPath } = await pathResolver(store.currentDir, args.output);

	const outputPathDir = path.dirname(outputPath);
	const isOutputDirExists = await checkIsFolderExists(outputPathDir);
	if (!isOutputDirExists) {
		await mkdir(outputPathDir, { recursive: true });
	}

	return {
		inputPath,
		outputPath,
	};
}
