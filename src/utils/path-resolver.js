import path from 'node:path';
import { checkIsFileExists } from './check-is-file-exists.js';
import { checkIsFolderExists } from './check-is-folder-exists.js';

export async function pathResolver(currentPath, pathToResolve) {
	const isAbsolute = path.isAbsolute(pathToResolve);

	const resolvedPath = isAbsolute ? pathToResolve : path.join(currentPath, pathToResolve);

	const isFileExists = await checkIsFileExists(resolvedPath);
	const isFolderExists = await checkIsFolderExists(resolvedPath);

	return {
		file: isFileExists ? resolvedPath : null,
		folder: isFolderExists ? resolvedPath : null,
		isPathExists: isFileExists || isFolderExists,
	};
}
