import { stat } from 'node:fs/promises';
import path from 'node:path';

export async function pathResolver(currentPath, cdPath) {
	const isAbsolute = path.isAbsolute(cdPath);
	let nextPath = null;
	if (isAbsolute) {
		nextPath = path.join(cdPath);
	} else {
		nextPath = path.join(currentPath, cdPath);
	}
	try {
		const stats = await stat(nextPath);
		if (!stats.isDirectory()) return RESULT.operationFailed;
		return nextPath;
	} catch {
		return null;
	}
}
