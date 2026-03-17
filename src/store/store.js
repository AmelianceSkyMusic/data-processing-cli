import { homedir } from 'os';
import { createStore } from '../utils/create-store.js';

export const store = createStore(
	{
		currentDir: homedir(),
	},
	(data) => ({
		set currentDir(newCurrentDir) {
			data.currentDir = newCurrentDir;
		},
		get currentDir() {
			return data.currentDir;
		},
	}),
);
