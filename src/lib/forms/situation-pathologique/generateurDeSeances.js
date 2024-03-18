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
	SECONDE_SEANCE
} from '../../stores/codeDetails';

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
				.set('hour', parseInt(premiere_seance_heure.split(':')[0]))
				.set('minute', parseInt(premiere_seance_heure.split(':')[1]))
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
			if (this.seancesGeneree.length < this.seances_normales_executables - this.deja_faites) {
				await this.createAddSeance(date, SEANCE_NORMALE, {});
			} else if (
				this.seancesGeneree.length <
				this.seances_en_depassement_executables +
					this.seances_normales_executables -
					this.deja_faites
			) {
				await this.createAddSeance(date, DEPASSEMENT, {});
			} else if (
				this.seancesGeneree.length <
				this.seances_normales_executables +
					this.seances_en_depassement_executables +
					this.seances_en_surdepassement_executables -
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
					if (date.isBefore(finDeValidite) || date.isSame(finDeValidite)) {
						await this.createAddSeance(date, SECONDE_SEANCE, { duree: 2, groupe: 2 });
					}
				}
			}
		}

		//* Ajout de la séance "Rapport écrit"
		//! tout bien réfléchis je pense que le rapport écrit ne devrait pas être généré tel une séance: il peut très bien rester comme une ligne d'information sur la situation pathologique et être généré à la volée avec l'attestation. Il faudrait alors ajouter un champ booléen pour savoir si c'est généré ? ou alors voir si la sp contient une attestation avec un rapport écrit avec une date
		// if (this.rapport_ecrit) {
		// 	let rapportDate;
		// 	switch (this.rapport_ecrit_date) {
		// 		case 'first':
		// 			rapportDate = dateList[0];
		// 			break;
		// 		case 'last':
		// 			rapportDate = dateList[dateList.length - 1];
		// 			break;
		// 		default:
		// 			dayjs(this.rapport_ecrit_custom_date);
		// 			break;
		// 	}
		// 	await this.createAddSeance(rapportDate, RAPPORT_ECRIT);
		// }
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
		let convention = await this.figuringConventionOut(date);
		//? Ensuite les données provenant du formulaire
		let sqlStatementArgs = [groupe ?? this.groupe_id, codeType, this.lieu_id];
		//? En ajoutant, si nécessaire, la durée
		if (this.duree) {
			sqlStatementArgs.push(this.duree);
		}
		if (this.volet_h) {
			sqlStatementArgs.push(this.volet_h);
		}
		//? "Compiler" la requête SQL
		let sqlStatement = `SELECT * from codes WHERE groupe = $1 AND type = $2 AND lieu = $3 AND convention_id = '${
			convention.convention_id
		}'${duree || this.duree ? ' AND duree = $4' : ''}${
			this.volet_h || [2, 3].includes(this.patho_lourde_type)
				? ` AND drainage = ${duree || this.duree ? '$5' : '$4'}`
				: ''
		};`;

		console.log(`le statement SQL : ${sqlStatement} et ses arguments : ${sqlStatementArgs}`);

		//? attendre la requête SQL
		let code = await this.db.select(sqlStatement, sqlStatementArgs);
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

	async figuringConventionOut(date) {
		//* D'abord il faut pouvoir obtenir toutes les conventions de l'année de la séance en cours :
		console.log('in figuringConventionOut() with', date.toDate());
		let conventionsThatYear = await this.db.select(
			'SELECT convention_id, year, month, day FROM conventions WHERE year = $1;',
			[date.year()]
		);
		// Trouver une convention dans les années précédentes
		while (conventionsThatYear.length == 0) {
			conventionsThatYear = await this.lastConventionFromLastYear(conventionsThatYear, date);
		}
		if (conventionsThatYear.length == 1) {
			//! À la base, je pensais devoir faire une enclave ici pour les cas où le gouvernement ne sort pas la dernière version le 1er Janvier de l'année courante. Mais en fait je pense que cela n'est pas nécessaire comme de toute façon la sortie d'une mise à jout en cours d'année fera un trigger sur les séances en cours...
			//! Allez vazy j'la fais quand même...
			let convDate = dayjs(
				new Date(
					conventionsThatYear[0].year,
					conventionsThatYear[0].month - 1,
					conventionsThatYear[0].day
				)
			);
			console.log('convDate', convDate.toDate());
			let check = convDate.isAfter(date);
			console.log(check);
			if (check) {
				return (await this.lastConventionFromLastYear(conventionsThatYear, date))[0];
			}
			return conventionsThatYear[0];
		} else if (conventionsThatYear.length > 1) {
			//! Ici, je vais quand même faire une enclave pour les années où le gouvernement ne sort pas la dernière version le 1er Janvier au cas où le kiné souhaite produire des séances TRES rétrospectivement (honnêtement je ne suis vrmt pas sûr ue ce soit nécessaire)

			let conv = conventionsThatYear.reduce((applicableConvention, convention) => {
				let conventionDate = dayjs(new Date(convention.year, convention.month - 1, convention.day));

				// Check if the convention date is before or on the infraction date
				if (conventionDate.isBefore(date) || conventionDate.isSame(date)) {
					// Update the applicable convention if it's more recent or if it's the first one found
					if (conventionDate.isAfter(applicableConvention)) {
						return convention;
					}
				}
				return applicableConvention;
			}, null);
			//? Donc ici, si il ne trouve pas de convention dans l'année courante parce que le gov a tardé, alors figuringConv..() choisira la dernière convention de l'année précédente
			if (!conv) {
				return (await this.lastConventionFromLastYear(conventionsThatYear, date))[0];
			}
		}
	}

	async lastConventionFromLastYear(conventionsThatYear, date) {
		console.log('in lastConventionFromLastYear() with', conventionsThatYear, date);
		conventionsThatYear = await this.db.select(
			'SELECT convention_id, year, month, day FROM conventions WHERE year = $1;',
			[date.year() - 1]
		);
		// Trouver la dernière convention de cette année là
		if (conventionsThatYear.length > 1) {
			conventionsThatYear.sort(
				(a, b) =>
					new Date(`${b.year}-${b.month - 1}-${b.day}`) -
					new Date(`${a.year}-${a.month - 1}-${a.day}`)
			);
			return (conventionsThatYear = [conventionsThatYear[0]]);
		}
		// ou retourner la seule convention découverte
		return conventionsThatYear;
	}

	get seances_normales_executables() {
		switch (this.groupe_id) {
			// Pathologie courante
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
					if (new Date().getFullYear() - this.patient.date_naissance.getFullYear() > 21) {
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
				if ([4, 5, 8].includes(lieu)) {
					// Pour les séance de 20 minutes au MR psycho etc...
					return 0;
				} else if ([0, 1, 2, 3, 7].includes(lieu)) {
					// 30min
					return 365;
				}
			// FB
			case 5:
				if (voletH) {
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
}
