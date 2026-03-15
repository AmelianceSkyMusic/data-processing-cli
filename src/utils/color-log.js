import { colorText } from './color-text.js';

export const colorLog = {
	error: (...arg) => console.error(colorText({ text: arg.join(' '), color: 'R' })),
	green: (...arg) => console.log(colorText({ text: arg.join(' '), color: 'G' })),
	magenta: (...arg) => console.log(colorText({ text: arg.join(' '), color: 'M' })),
};
