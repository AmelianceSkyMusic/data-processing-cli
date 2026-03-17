import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { PATH_TYPE } from './constants/path-type.js';
import { RESULT } from './constants/result.js';
import { store } from './store/store.js';
import { colorText } from './utils/color-text.js';
import { pathResolver } from './utils/path-resolver.js';

const typeWeights = {
	[PATH_TYPE.directory]: 1,

	[PATH_TYPE.directorySymlink]: 1,
	[PATH_TYPE.file]: 2,
	[PATH_TYPE.fileSymlink]: 2,
	[PATH_TYPE.other]: 3,
	[PATH_TYPE.otherSymlink]: 3,
};

const dirSort = (a, b) => {
	const weightA = typeWeights[a.type];
	const weightB = typeWeights[b.type];

	const weightDiff = weightA - weightB;

	return weightDiff !== 0 ? weightDiff : a.name.localeCompare(b.name);
};

export const navigation = {
	up: async (argList) => {
		if (argList.length > 0) return RESULT.invalidInput;

		const parsedPath = path.parse(store.currentDir);
		if (store.currentDir !== parsedPath.root) store.currentDir = parsedPath.dir;
		return RESULT.ok;
	},
	cd: async (cdPath) => {
		if (!cdPath) return RESULT.invalidInput;

		const { isFolderExists, resolvedPath: nextPath } = await pathResolver(
			store.currentDir,
			cdPath,
		);
		if (!isFolderExists) return RESULT.operationFailed;
		store.currentDir = nextPath;
		return RESULT.ok;
	},
	ls: async (argList) => {
		if (argList.length > 0) return RESULT.invalidInput;

		const dirData = await readdir(store.currentDir, { withFileTypes: true });

		if (!dirData.length) {
			console.log(`${colorText({ text: `[empty folder]`, style: 'FAINT' })}`);
			return RESULT.ok;
		}

		const dirList = [];
		let maxLengthName = 0;
		for (const dirElement of dirData) {
			let type = PATH_TYPE.other;

			if (dirElement.isSymbolicLink()) {
				const dirPath = path.join(dirElement.parentPath, dirElement.name);
				try {
					const elementStat = await stat(dirPath);
					if (elementStat.isFile()) {
						type = PATH_TYPE.fileSymlink;
					} else if (elementStat.isDirectory()) {
						type = PATH_TYPE.directorySymlink;
					} else {
						type = PATH_TYPE.otherSymlink;
					}
				} catch (error) {
					type = PATH_TYPE.otherSymlink;
				}
			} else if (dirElement.isFile()) {
				type = PATH_TYPE.file;
			} else if (dirElement.isDirectory()) {
				type = PATH_TYPE.directory;
			}

			if (dirElement.name.length > maxLengthName) maxLengthName = dirElement.name.length;

			dirList.push({ name: dirElement.name, type });
		}

		dirList.sort(dirSort).forEach((element) => {
			const spaces = ' '.repeat(maxLengthName - element.name.length + 1);

			console.log(
				`${colorText({ text: element.name, color: 'C' })}${spaces}${colorText({ text: `[${element.type}]`, style: 'FAINT' })}`,
			);
		});

		return RESULT.ok;
	},
};
