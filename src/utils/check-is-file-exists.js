import { stat } from 'node:fs/promises';

export async function checkIsFileExists(path) {
	try {
		const stats = await stat(path);
		return stats.isFile();
	} catch {
		return false;
	}
}
