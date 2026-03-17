import { logPath } from '../helpers/log-path.js';
import { store } from '../store/store.js';
import { colorLog } from '../utils/color-log.js';

export function initApp(rl) {
	colorLog.green('Welcome to Data Processing CLI!');
	logPath(store.currentDir);

	rl.setPrompt('> ');
	rl.prompt();
}
