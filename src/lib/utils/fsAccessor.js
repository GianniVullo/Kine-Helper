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
import { appState } from '../managers/AppState.svelte';
import { fetch as nativeFetch } from '@tauri-apps/plugin-http';
import { info } from '../cloud/libraries/logging';

export async function completePath() {
	if (platform() === 'windows') {
		return await documentDir();
	}
	let localDir = await appLocalDataDir();
	console.log('the local dir', localDir);
	return localDir;
}

export function baseDir() {
	if (platform() === 'windows') {
		return BaseDirectory.Document;
	}
	return BaseDirectory.AppLocalData;
}

// This is a legacy function because there was a bug on the tauri fs-plugin that didn't allow me to make use of their really usefull Basedir.AppLocalData
async function pathFormat(path) {
	console.log('in pathFormat with ', path);

	if (platform() === 'windows') {
		return path.replaceAll('/', '\\');
	}
	return path;
}

export async function create_directories(path) {
	// return await mkdir(await pathFormat(path), { baseDir: srcDir() });
	console.log('In create directory');

	return await mkdir(path, { baseDir: baseDir(), recursive: true });
}

export async function file_exists(path) {
	console.log('in file_exists with ', path);

	return await exists(path, { baseDir: baseDir() });
}

export async function save_local_file(path, fileName, fileContent) {
	console.log('in save_local_file with ', path, fileName, fileContent);
	let { formatedPath, error } = await setupBeforeSaveLocalFile(path, fileName);
	if (error) {
		console.error('Error setting up path before saving file:', error);
		throw error;
	}
	let dirPath = (await completePath()) + (platform() === 'windows' ? '\\' : '/') + formatedPath;

	let response = await invoke('setup_path', {
		dirPath,
		filePath: dirPath + (platform() === 'windows' ? '\\' : '/') + fileName,
		// This is bad Design... Should be corrected one day...
		// the fix should start from the open_remote_file and similar API. It needs to output allways the same type. Either Blob or Array of u8
		fileContent: Array.isArray(fileContent) ? fileContent : Array.from(await fileContent.bytes())
	});
	return response;
}

async function setupBeforeSaveLocalFile(path, fileName) {
	console.log('in setupBeforeSaveLocalFile with ', path, fileName);
	let formatedPath = await pathFormat(path);
	//* We might eventually catch a (directory already exist) wich is not a problem
	console.log('in save_to_disk with ', formatedPath);
	try {
		if (!(await file_exists(formatedPath))) {
			await create_directories(formatedPath);
		}
	} catch (error) {
		return { error };
	}
	return { formatedPath };
}

export async function saveRemoteFile(fileName, fileContent) {
	let { data, error: uploadError } = await supabase.storage
		.from('users')
		.upload(appState.user.id + '/prescriptions/' + fileName, fileContent);
	if (uploadError) {
		console.error('Error uploading file to Supabase:', uploadError);
		throw uploadError;
	}
	console.log('File uploaded successfully:', data);
}
export function arrayToFile(
	integers,
	filename = 'file.bin',
	mimeType = 'application/octet-stream'
) {
	const uint8Array = new Uint8Array(integers);
	return new File([uint8Array], filename, { type: mimeType });
}
// In the cloud version this needs to insert the file in the supabase storage
export async function save_to_disk(path, fileName, fileContent) {
	console.log('in save_to_disk with ', path, fileName, fileContent);

	try {
		//* First insert into Supabase storage
		await saveRemoteFile(fileName, fileContent);
		//* Then save to local disk
		let localResponse = await save_local_file(path, fileName, fileContent);
		console.log('localResponse', localResponse);
	} catch (saveError) {
		console.error('Error saving file:', saveError);
		return saveError;
	}
}

export async function remove_file(path, { recursive = false }) {
	console.log('in remove_file with ', path, recursive);

	try {
		//* First remove from Supabase storage
		let pathSplits = path.split('/');
		let fileName = pathSplits.pop();
		let removePath = `${appState.user.id}/prescriptions/${fileName}`;
		let { error } = await supabase.storage.from('users').remove([removePath]);
		console.log('remove_file error', error);
		if (error) {
			return error;
		}
		try {
			let resp = await remove(path, { baseDir: baseDir(), recursive });
			console.log('File removed successfully', resp);
			return null;
		} catch (removeError) {
			console.error('Error removing file from fs:', removeError);
			return removeError;
		}
	} catch (error) {
		return error;
	}
}

export async function read_file(path) {
	console.log('in read_file with ', path);
	return await readFile(path, { baseDir: baseDir() });
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
				let { data, error } = await open_remote_file('users', `${filePath}/${fileName}`);
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

export async function open_remote_file(bucket, path) {
	try {
		// if (platform() === 'ios') {
		info('Fetching convention data for iOS');
		let { data: urlData, error } = supabase.storage.from(bucket).getPublicUrl(path);
		info('urlData', urlData);
		const res = await nativeFetch(urlData.publicUrl, {
			method: 'GET',
			credentials: 'omit',
			headers: {
				Accept: 'application/octet-stream'
			}
		});
		info('response status', res.status);
		return { data: Array.from(await res.bytes()) };
		// } else {
		// 	// Récupérer le binary sur le serveur
		// 	let { data: blob, error } = await supabase.storage.from(bucket).download(path);
		// 	info('fetched convention data', blob);
		// 	info('Error fetching convention data', error);
		// 	return { data: blob };
		// }
	} catch (error) {
		return { error };
	}
}
