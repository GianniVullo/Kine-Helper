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
import { BaseDirectory, mkdir, remove, exists, readFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';
import { appLocalDataDir, documentDir } from '@tauri-apps/api/path';
import { supabase } from '../stores/supabaseClient';
import { user } from '../stores/UserStore';
import { get } from 'svelte/store';


async function completePath() {
	if (platform() === 'windows') {
		return await documentDir();
	}
	let localDir = await appLocalDataDir();
	console.log('the local dir', localDir);
	return localDir;
}

// This is a legacy function because there was a bug on the tauri fs-plugin that didn't allow me to make use of their really usefull Basedir.AppLocalData
async function pathFormat(path) {
	console.log('in pathFormat with ', path);

	if (platform() === 'windows') {
		return `kine-helper-\\${path.replaceAll('/', '\\')}`;
	}
	return path;
}

export async function create_directories(path) {
	// return await mkdir(await pathFormat(path), { baseDir: srcDir() });
	console.log('In create directory');

	return await mkdir(path, { baseDir: BaseDirectory.AppLocalData, recursive: true });
}

export async function file_exists(path) {
	console.log('in file_exists with ', path);

	return await exists(path, { baseDir: BaseDirectory.AppLocalData });
}

export async function save_to_disk(path, fileName, fileContent) {
	console.log('in save_to_disk with ', path, fileName, fileContent);
	let formatedPath = await pathFormat(path);
	let normalizedFileName = fileName;
	//* We might eventually catch a (directory already exist) wich is not a problem
	console.log('in save_to_disk with ', formatedPath);
	try {
		if (!(await file_exists(formatedPath))) {
			await create_directories(formatedPath);
		}
	} catch (error) {
		return error;
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
		return error;
	}
}

export async function remove_file(path, { recursive = false }) {
	console.log('in remove_file');

	try {
		return await remove(path, { baseDir: BaseDirectory.AppLocalData, recursive });
	} catch (error) {
		return error;
	}
}

export async function read_file(path) {
	console.log('in read_file with ', path);
	return await readFile(path, { baseDir: BaseDirectory.AppLocalData });
}

export async function open_file(path) {
	try {
		return await open(
			(await completePath()) + (platform() === 'windows' ? '\\' : '/') + (await pathFormat(path))
		);
	} catch (error) {
		return error;
	}
}

export async function save_user_file(filePath, fileName, fileContent) {
	switch (get(user)?.profil?.offre) {
		case 'free':
			return await save_to_disk(filePath, fileName, fileContent);

		case 'cloud':
			//! Encryption du fichier
			let base64ConvertedFile = await invoke('from_bytes_to_base64', fileContent);
			let encryptedBase64 = await invoke('encrypt_string', {
				input: base64ConvertedFile
			});
			let encryptedBase64ToBytes = await invoke('from_base64_to_bytes', { key: encryptedBase64 });
			return supabase.storage
				.from('users')
				.upload(`${filePath}/${fileName}`, Uint8Array.from(encryptedBase64ToBytes).buffer);

		default:
			console.log("Could not infer user's offre. Ouille aïe ouille.");
			break;
	}
}

export async function delete_user_file(filePath, fileName) {
	switch (get(user)?.profil?.offre) {
		case 'free':
			try {
				return await remove_file(`${filePath}/${fileName}`);
			} catch (error) {
				console.log('Error deleting local file: ', error);
			}
			break;

		case 'cloud':
			try {
				const { error } = await supabase.storage.from('users').remove([`${filePath}/${fileName}`]);
				if (error) {
					throw error;
				}
				console.log('File deleted from cloud storage');
			} catch (error) {
				console.log('Error deleting cloud file: ', error);
			}
			break;

		default:
			console.log("Could not infer user's offer. Ouille aïe ouille.");
			break;
	}
}

export async function retrieve_user_file(filePath, fileName) {
	switch (get(user)?.profil?.offre) {
		case 'free':
			try {
				// Retrieve the file from local disk
				return await read_file(`${filePath}/${fileName}`);
			} catch (error) {
				console.log('Error retrieving local file: ', error);
			}
			break;

		case 'cloud':
			try {
				// Retrieve the file from cloud storage
				let { data, error } = await supabase.storage
					.from('users')
					.download(`${filePath}/${fileName}`);
				if (error) {
					throw error;
				}
				console.log('File retrieved from cloud storage');
				return data;
			} catch (error) {
				console.log('Error retrieving cloud file: ', error);
			}
			break;

		default:
			console.log("Could not infer user's offer. Ouille aïe ouille.");
			break;
	}
}
