import { logPath } from '../helpers/log-path.js';
import { store } from '../store/store.js';
import { colorLog } from '../utils/color-log.js';

export function logResult(rl, result) {
	if (!result) return colorLog.error('RESULT OBJECT NOT PROVIDE!');
	if (result.ok === false) colorLog.error(result.error);
	logPath(store.currentDir);
	rl.prompt();
}
