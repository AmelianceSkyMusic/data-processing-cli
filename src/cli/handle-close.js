import { colorLog } from '../utils/color-log.js';

export function handleClose(rl) {
	rl.on('SIGINT', () => rl.close());

	rl.on('close', () => {
		(colorLog.magenta(`\rThank you for using Data Processing CLI!`), process.exit(0));
	});
}
