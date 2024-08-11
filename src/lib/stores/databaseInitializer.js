import Database from '@tauri-apps/plugin-sql';
import { supabase } from './supabaseClient';
import { invoke } from '@tauri-apps/api/core';

export class DBInitializer {
	async openDBConnection() {
		// await invoke("sql:allow-load")
		return await Database.load('sqlite:kinehelper.db');
	}

	// async closeDBConnection() {
	// 	return this.db.close();
	// }

	constructor() {}

	async initialization(submiter) {
		let db = await this.openDBConnection();
		// D'abord lister les fichiers dans le bucket static/codes
		let remoteFilesList = await supabase.storage.from('static').list('codes');
		remoteFilesList = remoteFilesList.data.map((val) => val.name);
		console.log('GZ stocké sur le bucket drive', remoteFilesList);
		// Ensuite fetcher les fichiers dans la base de données
		let localFilesList = await db.select('SELECT documents from conventions;');
		localFilesList = localFilesList.map((val) => val.documents);
		console.log(localFilesList);
		for (const convFile of remoteFilesList) {
			// Comparer la réponse avec la base de donnée
			if (!localFilesList.includes(convFile)) {
				console.log('Fetching', convFile);
				submiter.innerHTML = `Téléchargement de ${convFile}`;
				// Si le fichiers n'est pas dans notre DB alors on fetch du bucket et on peuple notre db
				await this.populateDB(db, convFile);
				submiter.innerHTML = `Traitement de ${convFile} terminé`;
			}
		}
		await db.close();
	}

	async populateDB(db, convFile) {
		// Récupérer le binary sur le serveur
		let { data, error } = await supabase.storage.from('static').download(`codes/${convFile}`);
		console.log(data);

		// Décompresser le fichier avec Rust
		let convention = await this.deflateFile(data);
		console.log(convention);
		// Insérer la convention d'abord
		await db.execute(
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
		console.log('convention inserted');
		
		// Ensuite insérer les codes avec l'ID de convention en FK
		for (const code of convention.codes) {
			console.log(code, 'insertion')
			await db.execute(
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
		}
	}
	async deflateFile(data) {
		let arr = data.stream();
		let reader = arr.getReader();
		return await invoke('convention_decompression', {
			value: Array.from((await reader.read()).value)
		});
	}

	async testingValues() {}
}
