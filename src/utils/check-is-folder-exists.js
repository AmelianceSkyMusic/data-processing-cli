import { stat } from 'node:fs/promises';

export async function checkIsFolderExists(path) {
	try {
		const stats = await stat(path);
		return stats.isDirectory();
	} catch {
		return false;
	}
}
