/**
 ** Here we define an helper for accessing paths
 ** we need it cause Windows doesn't allow majority of
 ** applications to access user\AppData folder.
 ** Also windows paths are written with \'s wich will be treated here
 *
 ** For security reasons I prefer to maintain the sandboxing
 ** wherever possible. So we're calling plaform() here to control
 ** the fileAccess flow wether its on windows machines or not.
 */

import { platform } from '@tauri-apps/plugin-os';
import {
	BaseDirectory,
	mkdir,
	remove,
	exists,
	readFile
} from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { appLocalDataDir, documentDir } from '@tauri-apps/api/path';

function srcDir() {
	if (platform() === 'windows') {
		return BaseDirectory.Document;
	}
	return BaseDirectory.AppLocalData;
}

async function completePath() {
	if (platform() === 'windows') {
		return await documentDir();
	}
	return await appLocalDataDir();
}

async function pathFormat(path) {
	if (platform() === 'windows') {
		return path.replace('/', '\\');
	}
	return path;
}

export async function create_directories(path) {
	return await mkdir(await pathFormat(path), { baseDir: srcDir() });
}

export async function file_exists(path) {
	return await exists(await pathFormat(path), { baseDir: srcDir() });
}

export async function save_to_disk(path, fileName, fileContent) {
	let formatedPath = await pathFormat(path);
	let normalizedFileName = fileName;
	//* We might eventually catch a (directory already exist) wich is not a problem
	console.log('in save_to_disk with ', formatedPath);
	try {
		if (!(await file_exists(formatedPath))) {
			await create_directories(formatedPath);
		}
	} catch (error) {
		console.log(error);
	}
	console.log('trying to write file');

	try {
		let dirPath = (await completePath()) + (platform() === 'windows' ? '\\' : '/') + formatedPath;
		let file_content = Array.from(fileContent);
		console.log(dirPath, fileName);
		let response = await invoke('setup_path', {
			dirPath,
			filePath: dirPath + (platform() === 'windows' ? '\\' : '/') + normalizedFileName,
			fileContent: file_content
		});
		console.log(response);
	} catch (error) {
		console.log(error);
	}
}

export async function remove_file(path, { recursive = false }) {
	return await remove(await pathFormat(path), { baseDir: srcDir(), recursive });
}

export async function read_file(path) {
	return await readFile(await pathFormat(path), { baseDir: srcDir() });
}

export async function open_file(path) {
	return await open((await completePath()) + (platform() === 'windows' ? '\\' : '/') + (await pathFormat(path)));
}
