import { colorText } from '../utils/color-text.js';

export function logPath(dir) {
	console.log(`You are currently in ${colorText({ text: dir, color: 'B', style: 'ITALIC' })}`);
}
