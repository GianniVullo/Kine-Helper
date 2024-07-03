import Database from '@tauri-apps/plugin-sql';
import dayjs from 'dayjs';
import { user } from '../../index';
import { get } from 'svelte/store';
import {
	SEANCE_NORMALE,
	DEPASSEMENT,
	DEPASSEMENT2,
	RAPPORT_ECRIT,
	EXAMEN_A_TITRE_CONSULTATIF,
	SECONDE_SEANCE,
	figuringConventionOut
} from '../../stores/codeDetails';
import { NomenclatureArchitecture } from '../../utils/nomenclatureManager';

export class GenerateurDeSeances {
	constructor({
		auto = true,
		groupe_id,
		lieu_id,
		amb_hos,
		duree,
		intake,
		examen_consultatif,
		examen_ecrit_date,
		rapport_ecrit,
		deja_faites = 0,
		rapport_ecrit_date,
		rapport_ecrit_custom_date,
		volet_j,
		seconde_seance_fa,
		duree_seconde_seance_fa,
		nombre_code_courant_fa,
		volet_h,
		patho_lourde_type,
		gmfcs,
		seconde_seance_e,
		premiere_seance,
		jour_seance_semaine_heures,
		nombre_seances,
		default_seance_description,
		patient,
		date_presta_chir_fa,
		seconde_seance_palliatif,
		premiere_seance_heure,
		sp_id,
		prescription_id
	}) {
		this.auto = auto;
		this.groupe_id = parseInt(groupe_id);
		this.lieu_id = parseInt(lieu_id);
		this.amb_hos = amb_hos;
		this.duree = parseInt(duree);
		this.intake = intake;
		this.examen_consultatif = examen_consultatif;
		this.examen_ecrit_date = examen_ecrit_date;
		this.rapport_ecrit = rapport_ecrit;
		this.rapport_ecrit_date = rapport_ecrit_date;
		this.rapport_ecrit_custom_date = rapport_ecrit_custom_date;
		this.volet_j = volet_j;
		this.seconde_seance_fa = seconde_seance_fa;
		this.duree_seconde_seance_fa = duree_seconde_seance_fa;
		this.date_presta_chir_fa = dayjs(date_presta_chir_fa).add(2, 'hour');
		this.nombre_code_courant_fa = nombre_code_courant_fa;
		this.volet_h = volet_h;
		this.patho_lourde_type = parseInt(patho_lourde_type);
		this.gmfcs = gmfcs;
		this.seconde_seance_e = seconde_seance_e;
		this.premiere_seance = dayjs(premiere_seance).add(2, 'hour');
		this.premiere_seance_heure = premiere_seance_heure;
		this.nombre_seances = nombre_seances;
		this.jour_seance_semaine_heures = jour_seance_semaine_heures;
		this.default_seance_description = default_seance_description;
		this.patient = patient;
		this.sp_id = sp_id;
		this.gen_id = crypto.randomUUID();
		this.prescription_id = prescription_id;
		this.seconde_seance_palliatif = seconde_seance_palliatif;
		this.deja_faites = deja_faites;
		this.db;
		this.architecture = new NomenclatureArchitecture(patient, {
			groupe_id,
			lieu_id,
			duree,
			patient,
			patho_lourde_type,
			gmfcs,
			volet_j,
			volet_h
		});
		this.seancesGeneree = [];
	}

	get toDB() {
		return {
			gen_id: this.gen_id,
			auto: this.auto,
			sp_id: this.sp_id,
			groupe_id: this.groupe_id,
			lieu_id: this.lieu_id,
			amb_hos: this.amb_hos,
			duree: this.duree,
			// intake: this.intake,
			// examen_consultatif: this.examen_consultatif,
			examen_ecrit_date: this.examen_ecrit_date,
			// rapport_ecrit: this.rapport_ecrit,
			// rapport_ecrit_date: this.rapport_ecrit_date,
			// rapport_ecrit_custom_date: this.rapport_ecrit_custom_date,
			volet_j: this.volet_j,
			seconde_seance_fa: this.seconde_seance_fa,
			duree_seconde_seance_fa: this.duree_seconde_seance_fa,
			date_presta_chir_fa: this.date_presta_chir_fa,
			nombre_code_courant_fa: this.nombre_code_courant_fa,
			volet_h: this.volet_h,
			patho_lourde_type: this.patho_lourde_type,
			gmfcs: this.gmfcs,
			seconde_seance_e: this.seconde_seance_e,
			premiere_seance: this.premiere_seance,
			nombre_seances: this.nombre_seances,
			jour_seance_semaine_heures: this.jour_seance_semaine_heures,
			default_seance_description: this.default_seance_description,
			deja_faites: this.deja_faites,
			user_id: get(user).user.id
		};
	}

	//? Ici on crée une liste de date en prenant en compte la date de la première séance, la quantité de séances à produire et les jours de la semaine à produire
	//! Ajouter une possibilité de mettre des jours de congés
	get dates() {
		console.log(
			'in generateDates',
			`Nombre de seances ${this.nombre_seances}`,
			'date première séance',
			this.premiere_seance,
			'days of week :',
			this.jour_seance_semaine_heures
		);
		let counter = (this.nombre_seances ?? 0) - 1;
		// (parce que ça commence à 0)
		let premiere_seance_date = this.premiere_seance_date_time();
		let datesList = [premiere_seance_date];
		for (var i = 1; counter > 0; i++) {
			let comparatingDate = this.premiere_seance;
			let dateToAnalize = comparatingDate.add(i, 'd');
			let day = `${dateToAnalize.day()}`;
			if (Object.keys(this.jour_seance_semaine_heures).includes(day)) {
				//! avec un and ici on peut ajouter les congés etc.
				let timestamps = this.jour_seance_semaine_heures[day].split(':');
				datesList.push(
					dateToAnalize
						.set('hour', parseInt(timestamps[0]))
						.set('minute', parseInt(timestamps[1]))
						.set('second', 0)
				);
				counter--;
			}
		}
		return datesList;
	}

	premiere_seance_date_time() {
		// Si l'utilisateur a spécifié une heure de début de séance
		if (this.premiere_seance_heure) {
			return this.premiere_seance
				.set('hour', parseInt(this.premiere_seance_heure.split(':')[0]))
				.set('minute', parseInt(this.premiere_seance_heure.split(':')[1]))
				.set('second', 0);
		}
		// Sinon on prend l'heure de début de séance par défaut le jour de la première séance
		let day = this.premiere_seance.day();
		let timestamps = this.jour_seance_semaine_heures[day].split(':');
		return this.premiere_seance
			.set('hour', parseInt(timestamps[0]))
			.set('minute', parseInt(timestamps[1]))
			.set('second', 0);
	}

	/**
	 * @param {Database} conn
	 */
	setdb(conn) {
		this.db = conn;
	}

	async seances() {
		// console.log('In seanceRepartitionLogic()');
		let dateList = this.dates;

		//* Création des séances de kinésithérapie
		for (const date of dateList) {
			if (
				this.seancesGeneree.length <
				this.architecture.seances_normales_executables - this.deja_faites
			) {
				await this.createAddSeance(date, SEANCE_NORMALE, {});
			} else if (
				this.seancesGeneree.length <
				this.architecture.seances_en_depassement_executables +
					this.architecture.seances_normales_executables -
					this.deja_faites
			) {
				await this.createAddSeance(date, DEPASSEMENT, {});
			} else if (
				this.seancesGeneree.length <
				this.architecture.seances_normales_executables +
					this.architecture.seances_en_depassement_executables +
					this.architecture.seances_en_surdepassement_executables -
					this.deja_faites
			) {
				await this.createAddSeance(date, DEPASSEMENT2, {});
			}
		}

		//* AJOUT des séances "séconde séance dans la même journée"
		if (this.seconde_seance_e || this.seconde_seance_palliatif) {
			for (const date of dateList) {
				await this.createAddSeance(date, SECONDE_SEANCE, {});
			}
		}
		if (this.seconde_seance_fa) {
			// Soit 15 min
			if (this.duree_seconde_seance_fa == 0) {
				// Dans ce cas on peut seulement en faire 14 dans les 30 jours après date_presta_chir_fa
				let finDeValidite = dayjs(this.date_presta_chir_fa);
				finDeValidite = finDeValidite.add(30, 'day');
				// console.log(`la première séance est le ${this.premiere_seance}`);
				for (const date of dateList) {
					if (date.isBefore(finDeValidite) || date.isSame(finDeValidite)) {
						await this.createAddSeance(date, SECONDE_SEANCE, { duree: 0, groupe: 2 });
					}
				}
			}
			if (this.duree_seconde_seance_fa == 2) {
				for (const date of dateList) {
					// Dans ce cas il n'y a pas de limite de validité
					//? Or does it ?
					if (date.isBefore(finDeValidite) || date.isSame(finDeValidite)) {
						await this.createAddSeance(date, SECONDE_SEANCE, { duree: 2, groupe: 2 });
					}
				}
			}
		}

		//* Ajout de la séance "Rapport écrit"
		//! tout bien réfléchis je pense que le rapport écrit ne devrait pas être généré tel une séance: il peut très bien rester comme une ligne d'information sur la situation pathologique et être généré à la volée avec l'attestation. Il faudrait alors ajouter un champ booléen pour savoir si c'est généré ? ou alors voir si la sp contient une attestation avec un rapport écrit avec une date
		//* Ajout de la séance "Examen à titre consultatif"
		if (this.examen_consultatif) {
			// console.log('WITH EXAMEN consultatif');
			await this.createAddSeance(dayjs(this.examen_ecrit_date), EXAMEN_A_TITRE_CONSULTATIF, {});
		}
		return this.seancesGeneree;
	}

	async createAddSeance(date, codeType, { duree, groupe }) {
		console.log('in createAddSeance() for date :', date);
		//* Définir les arguments permettant la recherche du code dans la DB
		//? D'abord la convention
		let convention = await figuringConventionOut(date, this.db);

		//? "Compiler" la requête SQL
		let sqlStatement = this.sqlQueryCompiler(convention, { groupe, codeType, duree });

		console.log('sqlStatement', sqlStatement);

		//? attendre la requête SQL
		let code = await this.db.select(sqlStatement[0], sqlStatement[1]);
		console.log('the code found in the db', code);
		//! Ici il y avait des attributs spécifiant l'heure de début et de fin du rdv ( start & end ). Je fais, pour l'instant, le choix de ne plus utiliser ces attributs, de transformer le datatype de seance.date en timestamps et de rendre la durée du rdv implicite ( définie par le code )
		let seance = {
			user_id: get(user).user.id,
			patient_id: this.patient.patient_id,
			sp_id: this.sp_id,
			prescription_id: this.prescription_id,
			gen_id: this.gen_id,
			seance_id: crypto.randomUUID(),
			created_at: dayjs().format('YYYY-MM-DDTHH:mm:00'),
			code_id: code[0].code_id,
			date: date.format('YYYY-MM-DDTHH:mm:00'),
			description: this.default_seance_description
			//// start: rendezVousStart.toDate(),
			//// end: rendezVousEnd.toDate()
		};
		console.log(seance);
		//*Ajout de la séance créée à la list de séances générées
		this.seancesGeneree.push(seance);
	}

	sqlQueryCompiler(convention, { groupe, codeType, duree } = {}) {
		//? Ensuite les données provenant du formulaire
		let sqlStatementArgs = [groupe ?? this.groupe_id, codeType, this.lieu_id];
		let sqlStatement = `SELECT * from codes WHERE groupe = $1 AND type = $2 AND lieu = $3 AND convention_id = '${convention.convention_id}'`;
		switch (this.groupe_id) {
			case 1:
				const defaultCase = () => {
					if ([4, 5, 8].includes(this.lieu_id)) {
						// 20min
						sqlStatementArgs.push(1);
					} else {
						// 30min
						sqlStatementArgs.push(2);
					}
					return [`${sqlStatement} AND duree = $4;`, sqlStatementArgs];
				}
				switch (this.patho_lourde_type) {
					case 0:
						// 20 ou 30 min
						return defaultCase();
					case 1:
						// Si le patient est dans son 21ième anniversaire
						if (
							new Date().getFullYear() - new Date(this.patient.date_naissance).getFullYear() >
							21
						) {
							if (this.gmfcs > 3) {
								if (this.seancesGeneree.length < 200) {
									sqlStatementArgs.push(4);
									sqlStatementArgs.push(false);
									sqlStatementArgs.push(1);
									return [`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`, sqlStatementArgs];
								} else {
									return defaultCase();
								}
							} else if (this.gmfcs > 1) {
								if (this.seancesGeneree.length < 150) {
									sqlStatementArgs.push(4);
									sqlStatementArgs.push(false);
									sqlStatementArgs.push(1);
									return [`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`, sqlStatementArgs];
								} else {
									return defaultCase();
								}
							} else {
								if (this.seancesGeneree.length < 100) {
									sqlStatementArgs.push(4);
									sqlStatementArgs.push(false);
									sqlStatementArgs.push(1);
									return [`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`, sqlStatementArgs];
								} else {
									return defaultCase();
								}
							}
						} else {
							sqlStatementArgs.push(4);
							sqlStatementArgs.push(false);
							sqlStatementArgs.push(1);
							return [`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`, sqlStatementArgs];
						}
					case 2:
						// 60 min
						if (this.seancesGeneree.length < 120) {
							sqlStatementArgs.push(4);
							sqlStatementArgs.push(true);
							return [`${sqlStatement} AND duree = $4 AND drainage = $5;`, sqlStatementArgs];
						} else {
							return defaultCase();
						}
					case 3:
						// 120 min
						if (this.seancesGeneree.length < 120) {
							sqlStatementArgs.push(5);
							sqlStatementArgs.push(true);
							return [`${sqlStatement} AND duree = $4 AND drainage = $5;`, sqlStatementArgs];
						} else {
							return defaultCase();
						}
					case 4:
						// 45 min
						if (this.seancesGeneree.length < 50) {
							sqlStatementArgs.push(3);
							return [`${sqlStatement} AND duree = $4;`, sqlStatementArgs];
						} else {
							return defaultCase();
						}
					case 5:
						if (this.seancesGeneree.length < 30) {
							sqlStatementArgs[1] = 1;
							sqlStatementArgs.push(4);
							sqlStatementArgs.push(false);
							sqlStatementArgs.push(4);
							return [
								`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`,
								sqlStatementArgs
							];
						} else {
							return defaultCase();
						}
				}
			default:
				//? En ajoutant, si nécessaire, la durée
				if (this.duree) {
					sqlStatementArgs.push(this.duree);
				}
				if (this.volet_h) {
					sqlStatementArgs.push(this.volet_h);
				}
				return [
					`${sqlStatement}${duree || this.duree ? ' AND duree = $4' : ''}${
						this.volet_h ? ` AND drainage = ${duree || this.duree ? '$5' : '$4'}` : ''
					};`,
					sqlStatementArgs
				];
		}
	}
}
