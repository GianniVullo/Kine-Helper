import { appState } from '../managers/AppState.svelte';
import { Code, indmeniteCategory } from '../stores/codeDetails';
import { get, writable } from 'svelte/store';

export function createCodeMap() {
	let codeMap = writable();
	function groupes_has_rapport() {
		let groupes = [];
		let codes = get(codeMap);
		for (const codeId of codes.keys()) {
			if (Array.isArray(codes.get(codeId))) {
				for (const code of codes.get(codeId)) {
					groupes.push(code.groupe_id);
				}
				continue;
			}
			groupes.push(codes.get(codeId).groupe_id);
		}
		return groupes.includes(1) || groupes.includes(4) || groupes.includes(5);
	}
	function groupes_has_intake() {
		let groupes = [];
		let codes = get(codeMap);
		for (const codeId of codes.keys()) {
			if (codeId === 'intake') {
				continue;
			}
			if (Array.isArray(codes.get(codeId))) {
				for (const code of codes.get(codeId)) {
					groupes.push(code.groupe_id);
				}
				continue;
			}
			groupes.push(codes.get(codeId).groupe_id);
		}
		return groupes.includes(0);
	}
	function is_lieu3() {
		let groupes = [];
		let codes = get(codeMap);
		for (const codeId of codes.keys()) {
			if (codeId === 'indemnites') {
				continue;
			}
			if (Array.isArray(codes.get(codeId))) {
				for (const code of codes.get(codeId)) {
					groupes.push(code.lieu_id);
				}
				continue;
			}
			groupes.push(codes.get(codeId).lieu_id);
		}
		return groupes.includes(3);
	}
	return {
		subscribe: codeMap.subscribe,
		set: codeMap.set,
		update: codeMap.update,
		groupes_has_rapport,
		groupes_has_intake,
		is_lieu3
	};
}

export function fetchCodeDesSeances(loading, seances, sp) {
	console.log('in fetchCodeDesSeances() with', seances);
	let guesseur = new NomenclatureManager();
	if (loading) {
		loading.update((n) => true);
	}
	return new Promise(async (resolve) => {
		let db = guesseur.database;
		await guesseur.bulkGuess(seances, async (seances) => {
			for (const seance of seances) {
				await guesseur.getCode(seance, db);
			}
			if (sp.with_indemnity || sp.with_rapport || sp.with_intake) {
				await guesseur.collectIndemnitIntakeeEtRapporEcrit();
			}
		});
		resolve(guesseur.cache);
	});
}

export class NomenclatureArchitecture {
	constructor(patient, sp) {
		console.log('in NomenclatureArchitecture.constructor() with', patient, 'AND', sp);
		this.groupe_id = parseInt(sp.groupe_id);
		this.lieu_id = sp.lieu_id;
		this.duree = sp.duree;
		this.patient = patient;
		this.patho_lourde_type = sp.patho_lourde_type;
		this.gmfcs = sp.gmfcs;
		this.volet_j = sp.volet_j;
		this.volet_h = sp.volet_h;
		this.deja_faites = sp.deja_faites;
	}

	get seances_normales_executables() {
		switch (this.groupe_id) {
			// Pathologie courante
			// TODO Ajouter un check up du nombre effectuer dans d'autres sp. Ce n'était pas urgent parce que les kinés sont sensés savoir mais maintenant il faut le faire. Mais attend parce que le problème c'est les demande de prolongation
			case 0:
				if ([4, 5, 8].includes(this.lieu_id)) {
					// 20min
					return 18;
				} else if ([0, 1, 2, 3, 7].includes(this.lieu_id) || parseInt(this.duree) == 2) {
					// 30min
					return 9;
				} else {
					return 365; // 15 min et c'est en Hopital donc illimité
				}
			// Pathologie Lourde
			case 1:
				if (this.patho_lourde_type == 1) {
					// Si le patient est dans son 21ième anniversaire
					if (new Date().getFullYear() - new Date(this.patient.date_naissance).getFullYear() > 21) {
						if (this.gmfcs > 3) {
							return 200;
						} else if (this.gmfcs > 1) {
							return 150;
						} else {
							return 100;
						}
					}
				} else if ([2, 3].includes(this.patho_lourde_type)) {
					//? drainage
					// Que ce soit 60 ou 120 min c'est 120 séances/an autorisées
					return 120;
				} else if (this.patho_lourde_type == 4) {
					// 45 min, doi être explicitement mentionnée sur la prescription
					return 50;
				} else if (this.patho_lourde_type == 5) {
					// si il s'agit des séances de 60 minutes au global pour les pathos du volet J)
					return 30; // /!\ il s'agit de 10/prescriptions
				}
				return 365;
			// Grossesse et Post-partum
			case 3:
				return 9;
			// FA
			case 4:
				if ([4, 5, 8].includes(this.lieu_id)) {
					// Pour les séance de 20 minutes au MR psycho etc...
					if (this.volet_j) {
						// pour le cas des polytraumatisés (Onglet J)
						return 120;
					}
					return 60;
				} else if ([0, 1, 2, 3, 7].includes(this.lieu_id)) {
					// 30min
					return 20;
				}
				return 0;
			// FB
			case 5:
				return 60;
			// Palliatif à domicile
			case 6:
				return 365; // Jusqu'à la fin
			// Hopital
			case 7:
				return 365;
		}
	}

	get seances_en_depassement_executables() {
		switch (this.groupe_id) {
			// Pathologie courante
			case 0:
				if ([4, 5, 8].includes(this.lieu_id)) {
					// 20min
					return 54;
				} else if ([0, 1, 2, 3, 7].includes(this.lieu_id) || parseInt(this.duree) == 2) {
					// 30min
					return 9;
				} else {
					return 0;
				}
			// Pathologie Lourde
			case 1:
				return 0;
			// Grossesse et Post-partum
			case 3:
				return 0;
			// FA
			case 4:
				if ([4, 5, 8].includes(this.lieu_id)) {
					// Pour les séances de 20 minutes au MR psycho etc...
					return 365;
				} else if ([0, 1, 2, 3, 7].includes(this.lieu_id)) {
					// 30min
					if (this.volet_j) {
						return 100;
					}
					return 40;
				}
			// FB
			case 5:
				// Ici il y a une variante : les drainages lymphatiques n'ont pas de dépassement. Le kiné effectue 60 drainages de 45 minutes puis il y a les codes normaux de 30 minutes.
				if (this.volet_h) {
					return 0;
				}
				return 20;
			// Palliatif à domicile
			case 6:
				return 0;
			// Hopital
			case 7:
				return 0;
		}
	}

	get seances_en_surdepassement_executables() {
		switch (this.groupe_id) {
			// Pathologie courante
			case 0:
				if ([4, 5, 8].includes(this.lieu_id)) {
					// 20min
					return 0; // (Il n'y a pas de surchargement)
				} else if ([0, 1, 2, 3, 7].includes(this.lieu_id) || parseInt(this.duree) == 2) {
					return 54;
				} else {
					return 0;
				}
			// Pathologie Lourde
			case 1:
				return 0;
			// Grossesse et Post-partum
			case 3:
				return 0;
			// FA
			case 4:
				if ([4, 5, 8].includes(this.lieu_id)) {
					// Pour les séance de 20 minutes au MR psycho etc...
					return 0;
				} else if ([0, 1, 2, 3, 7].includes(this.lieu_id)) {
					// 30min
					return 365;
				}
			// FB
			case 5:
				if (this.volet_h) {
					// :/!\ le dépassement pour les
					// drainage est en faite le dépassement pour les 30 minutes.
					return 0;
				}
				return 365;
			// Palliatif à domicile
			case 6:
				return 0;
			// Hopital
			case 7:
				return 0;
		}
	}

	architecture(codes) {
		console.log('in NomenclatureArchitecture.architecture() with', codes, 'AND', this);
		let normales = this.seances_normales_executables - this.deja_faites;
		let depassements = this.seances_en_depassement_executables;
		let surdepassements = this.seances_en_surdepassement_executables;
		if (normales < 0) {
			normales = 0;
			depassements -= this.deja_faites - this.seances_normales_executables;
		}
		if (depassements < 0) {
			depassements = 0;
			surdepassements -= this.deja_faites - this.seances_en_depassement_executables;
		}
		switch (this.groupe_id) {
			// Pathologie courante
			case 0:
				codes = codes.filter((code) => code.groupe === 0);
				//? Ici on pourrait croire qu'il faut s'amuser à faire varier la liste en fonctoin de la durée mais en fait ce n'est pas nécessaire car cette variation se retrouve dans le this.seances_x_executables
				return [
					[...Array(normales)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 0)
					),
					[...Array(depassements)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 1)
					),
					[...Array(surdepassements)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 2)
					)
				];
			// Pathologie Lourde
			case 1:
				codes = codes.filter((code) => code.groupe === 1);
				function defaultCase(number, lieu_id) {
					console.log('in defaultCase() with', number, 'and', codes);
					return [...Array(number)].map((idx) =>
						codes.find(
							(code) =>
								code.lieu === lieu_id &&
								code.type === 0 &&
								([4, 5, 8].includes(lieu_id) ? code.duree === 1 : code.duree === 2)
						)
					);
				}
				switch (this.patho_lourde_type) {
					//séances normales 20 ou 30 min
					case 0:
						console.log('in case 0 with ', defaultCase(normales, this.lieu_id));
						return [...defaultCase(normales, this.lieu_id)];
					// IMC
					case 1:
						// Si le patient est dans son 21ième anniversaire
						let allowedNumber;
						if (
							new Date().getFullYear() - new Date(this.patient.date_naissance).getFullYear() >
							21
						) {
							if (this.gmfcs > 3) {
								allowedNumber = 200;
							} else if (this.gmfcs > 1) {
								allowedNumber = 150;
							} else {
								allowedNumber = 100;
							}
						} else {
							allowedNumber = 365;
						}
						return [
							[...Array(normales)].map((idx) =>
								codes.find(
									(code) =>
										code.lieu === this.lieu_id &&
										code.type === 0 &&
										code.duree === 4 &&
										!code.drainage &&
										code.lourde_type === 1
								)
							),
							...defaultCase(365 - allowedNumber, this.lieu_id)
						];
					// Drainage
					case 2:
						return [
							[...Array(normales)].map((idx) =>
								codes.find(
									(code) =>
										code.lieu === this.lieu_id &&
										code.type === 0 &&
										code.duree === this.duree &&
										code.drainage
								)
							),
							...defaultCase(365 - normales, this.lieu_id)
						];
					case 3:
						return [
							[...Array(normales)].map((idx) =>
								codes.find(
									(code) => code.lieu === this.lieu_id && code.type === 0 && code.duree === 3
								)
							),
							...defaultCase(365 - normales, this.lieu_id)
						];
					case 4:
						return [
							[...Array(normales)].map((idx) =>
								codes.find(
									(code) =>
										code.lieu === this.lieu_id &&
										code.type === 1 &&
										code.duree === 4 &&
										code.lourde_type === 4
								)
							),
							...defaultCase(365 - normales, this.lieu_id)
						];
				}
			// Grossesse et Post-partum
			case 3:
				codes = codes.filter((code) => code.groupe === 3);
				return [
					[...Array(normales)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 0)
					)
				];
			// FA
			case 4:
				codes = codes.filter((code) => code.groupe === 4);
				return [
					[...Array(normales)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 0)
					),
					[...Array(depassements)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 1)
					),
					[...Array(surdepassements)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 2)
					)
				];
			// FB
			case 5:
				codes = codes.filter((code) => code.groupe === 5);
				return [
					[...Array(normales)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 0)
					),
					[...Array(depassements)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 1)
					),
					[...Array(surdepassements)].map((idx) =>
						codes.find((code) => code.lieu == this.lieu_id && code.type === 2)
					)
				];
			// Palliatif à domicile
			case 6:
				codes = codes.filter((code) => code.groupe === 6);
				return [[...Array(normales)].map((idx) => codes.find((code) => code.duree === 2))];
			// Hopital
			case 7:
				codes = codes.filter((code) => code.groupe === 7);
				return [
					[...Array(normales)].map(
						(idx) => codes[0] // y'en a qu'un seul
					)
				];
			default:
				return [];
		}
	}
}

export class NomenclatureManager {
	constructor() {
		this.database = appState.db;
		this.cache = new Map();
	}

	async bulkGuess(seances, plugin) {
		console.log('in NomenclatureManager.bulkGuess() with', seances);
		// plugin
		let guess = plugin(seances);
		return guess;
	}

	async collectIndemnitIntakeeEtRapporEcrit() {
		console.log('in NomenclatureManager.collectIndemnitIntakeeEtRapporEcrit() with', this.cache);
		let db = this.database;
		let rapportEcrits = [];
		let indemnites = [];
		let intake = [];
		const code = Array.from(this.cache.values())[0];
		let indemnitesQuery = await db.select(
			'SELECT * FROM codes WHERE groupe = 9 AND convention_id = $1',
			[code.convention_id]
		);
		let intakeQuery = await db.select(
			'SELECT * FROM codes WHERE groupe = 0 AND type = 6 AND lieu = $1 AND convention_id = $2',
			[code.lieu_id, code.convention_id]
		);
		let rapportEcritsQuery = await db.select(
			'SELECT * FROM codes WHERE groupe = $1 AND lieu = $2 AND type = 3 AND convention_id = $3',
			[code.groupe_id, code.lieu_id, code.convention_id]
		);
		indemnites.push(
			indemnitesQuery
				.map((code) => new Code(code))
				.find((c) => c.code_reference === indmeniteCategory[code.groupe_id])
		);
		if (intakeQuery.length > 0) {
			intake.push(new Code(intakeQuery[0]));
		}
		if (rapportEcritsQuery.length > 0) {
			rapportEcrits.push(new Code(rapportEcritsQuery[0]));
		}
		this.cache.set('indemnites', indemnites);
		this.cache.set('rapports', rapportEcrits);
		this.cache.set('intake', intake);
	}

	async durationGuesser(seances) {
		let db = this.database;
		let guess = await this.durationPlugin(seances, db);
		return guess;
	}

	async lieu_idAggregator(seances) {
		let db = this.database;
		let guess = await this.lieu_idPlugin(seances, db);
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
