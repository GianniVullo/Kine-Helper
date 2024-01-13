import Database from '@tauri-apps/plugin-sql';
import { DBInitializer } from '../stores/databaseInitializer';
import { Code } from '../stores/codeDetails';

export class NomenclatureManager {
	constructor() {
		this.database = new DBInitializer();
		this.cache = new Map();
	}

	async bulkGuess(seances, plugin) {
		console.log('in NomenclatureManager.bulkGuess() with', seances);

		let db = await this.database.openDBConnection();
		// plugin
		let guess = plugin(seances, db);
		await db.close();
		return guess;
	}

	async collectIndemnitIntakeeEtRapporEcrit() {
		console.log('in NomenclatureManager.collectIndemnitIntakeeEtRapporEcrit() with');
		let db = await this.database.openDBConnection();
		let rapportEcrits = [];
		let indemnites = [];
		let intake = [];
		for (const code of this.cache.values()) {
			let indemnitesQuery = await db.select(
				'SELECT * FROM codes WHERE groupe = 9 AND convention_id = $1',
				[code.convention_id]
			);
			let intakeQuery = await db.select(
				'SELECT * FROM codes WHERE groupe = 0 AND type = 6 AND lieu = $1 AND convention_id = $2',
				[code.lieu_id, code.convention_id]
			);
			let rapportEcritsQuery = await db.select(
				'SELECT * FROM codes WHERE groupe = $1 AND lieu = $2 AND type = 3 AND convention_id = $2',
				[code.groupe_id, code.lieu_id, code.convention_id]
			);
			indemnites.push(...indemnitesQuery.map((code) => new Code(code)));
			if (intakeQuery.length > 0) {
				intake.push(new Code(intakeQuery[0]));
			}
			if (rapportEcritsQuery.length > 0) {
				rapportEcrits.push(new Code(rapportEcritsQuery[0]));
			}
		}
		await db.close();
		this.cache.set('indemnites', indemnites);
		this.cache.set('rapports', rapportEcrits);
		this.cache.set('intake', intake);
	}

	async durationGuesser(seances) {
		let db = await this.database.openDBConnection();
		let guess = await this.durationPlugin(seances, db);
		await db.close();
		return guess;
	}

	async lieu_idAggregator(seances) {
		let db = await this.database.openDBConnection();
		let guess = await this.lieu_idPlugin(seances, db);
		await db.close();
		return guess;
	}

	async durationPlugin(seances, db) {
		let durations = [];
		for (const seance of seances) {
			let code = await this.getCode(seance, db);
			const duration = code.duree_min_int;
			durations.push(duration);
		}
		return durations;
	}

	async lieu_idPlugin(seances, db) {
		let lieu_ids = [];
		for (const seance of seances) {
			let code = await this.getCode(seance, db);
			const lieu_id = code.lieu_id;
			lieu_ids.push(lieu_id);
		}
		return lieu_ids;
	}

	async getCode(seance, db) {
		// D'abord obtenir le code_id de la seance
		let code_id = seance.code_id;
		// Ensuite obtenir le code ds le cache ou la db
		let code;
		if (this.cache.has(code_id)) {
			code = this.cache.get(code_id);
		} else {
			let queriedCode = await db.select('SELECT * FROM codes WHERE code_id = $1', [code_id]);
			// console.log('Le code queried', queriedCode);
			code = new Code(queriedCode[0]);
			this.cache.set(code_id, code);
		}
		return code;
	}
}
