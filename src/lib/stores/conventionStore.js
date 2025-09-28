import { invoke } from '@tauri-apps/api/core';
import { supabase } from './supabaseClient';
// import { LocalDatabase } from './databaseInitializer';
import { platform } from '@tauri-apps/plugin-os';
// import { fetch as nativeFetch } from '@tauri-apps/plugin-http';
import { open_remote_file } from '../utils/fsAccessor';
import { info } from '../cloud/libraries/logging';

export async function checkAndUpdateConventions(submiter, db) {
	// D'abord lister les fichiers dans le bucket static/codes
	let remoteFilesList = await supabase.storage.from('static').list('codes');
	if (remoteFilesList.error) {
		return { error: remoteFilesList.error };
	}
	remoteFilesList = remoteFilesList.data.map((val) => val.name);
	info('GZ stocké sur le bucket drive', remoteFilesList);
	// Ensuite fetcher les fichiers dans la base de données
	let { data: localFilesList, error: localFileError } = await db.select(
		'SELECT documents from conventions;'
	);
	if (localFileError) {
		return { error: localFileError };
	}
	localFilesList = localFilesList.map((val) => val.documents);
	info('localFilesList', localFilesList);
	for (const convFile of remoteFilesList) {
		// Comparer la réponse avec la base de donnée
		if (!localFilesList.includes(convFile)) {
			info('Fetching', convFile);
			submiter = `Téléchargement de ${convFile}`;
			// Si le fichiers n'est pas dans notre DB alors on fetch du bucket et on peuple notre db
			await populateDB(db, convFile);
			submiter = `Traitement de ${convFile} terminé`;
		}
	}
	info('Conventions mises à jour');
	return { data: 'Conventions mises à jour' };
}

async function populateDB(db, convFile) {
	info('populateDB', convFile);
	let { data, error } = await open_remote_file('static', `codes/${convFile}`);

	if (error) {
		throw new Error(error);
	}

	// Décompresser le fichier avec Rust
	let convention = await deflateFile(
		Array.isArray(data) ? data : Array.from(await fileContent.bytes())
	);
	info('convention_id', convention.convention_id);
	// Insérer la convention d'abord
	const { data: convInsertionData, error: convInsertionError } = await db.execute(
		'INSERT into conventions (convention_id, titre, documents, created_at, year, month, day) VALUES ($1, $2, $3, $4, $5, $6, $7)',
		[
			convention.convention_id,
			convention.titre,
			convention.documents,
			convention.created_at,
			convention.year,
			convention.month,
			convention.day
		]
	);
	info('convention inserted');
	if (convInsertionError) {
		info('Error inserting convention', convInsertionError);
		return { error: convInsertionError };
	} else {
		info('Convention inserted', convInsertionData);
	}

	// Ensuite insérer les codes avec l'ID de convention en FK
	for (const code of convention.codes) {
		const { data: codeInsertionData, error: codeInsertionError } = await db.execute(
			'INSERT INTO codes (code_id, code_reference, groupe, type, duree, lieu, amb_hos, lourde_type, drainage, honoraire, coefficient, remboursement, valeur, convention_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
			[
				code.code_id,
				code.code_reference,
				code.groupe,
				code.type,
				code.duree,
				code.lieu,
				code.amb_hos,
				code.lourde_type,
				code.drainage,
				code.honoraire,
				code.coefficient,
				code.remboursement,
				code.valeur,
				code.convention_id
			]
		);
		if (codeInsertionError) {
			info('Error inserting code', codeInsertionError);
			return { error: codeInsertionError };
		} else {
			info('Code inserted', code.code_reference, codeInsertionData);
		}
	}
	return { data: 'Conventions mises à jour' };
}
async function deflateFile(data) {
	if (platform() === 'ios') {
		// iOS specific implementation
		return await invoke('convention_decompression', {
			value: data
		});
	} else {
		let arr = data.stream();
		let reader = arr.getReader();
		return await invoke('convention_decompression', {
			value: Array.from((await reader.read()).value)
		});
	}
}
