import dayjs from 'dayjs';
import {
	SEANCE_NORMALE,
	DEPASSEMENT,
	DEPASSEMENT2,
	EXAMEN_A_TITRE_CONSULTATIF,
	SECONDE_SEANCE
} from '../stores/codeDetails.js';
import { appState } from './AppState.svelte';

const SEANCE_KINE = 0;
const SEANCE_CONSULTATIVE = 1;
const SEANCE_SECONDE = 2;
const NO_SHOW = 3;

/**
 **   Il faut qu'on puisse donner des cades aux séances... Pour ça il faut savoir toutes les séances qui ont été déjà tarifée dans la sp. puis y ajouter
 */

export function assignCodes2({
	sp,
	seance,
	indexOfSeance,
	architecture,
	patient,
	convention,
	seancesGeneree,
	prescription
}) {
	console.log('assignCodes2 with seance', seance);

	let sqlAgreg;
	let queryCompilerArgs = {
		groupe_id: sp.groupe_id ?? seance.groupe_id,
		duree: seance.duree,
		lieu_id: seance.lieu_id,
		patho_lourde_type: sp.patho_lourde_type,
		patient,
		seancesGeneree,
		gmfcs: sp.gmfcs,
		volet_h: sp.groupe_id === 5 && seance.duree === 3
	};
	let codeType;
	let groupe_id;
	let duree;
	if (seance.seance_type === SEANCE_KINE) {
		const seancesAlreadyTarifed = sp.seances.filter((s) => {
			switch (sp.groupe_id) {
				case (0, 5):
					return (
						s.has_been_attested &&
						dayjs(s.date).year() === dayjs().year() &&
						seance.seance_type === 0
					);
				default:
					return s.has_been_attested && s.seance_type === 0;
			}
		});
		console.log('seancesAlreadyTarifed', seancesAlreadyTarifed);

		// Définition du compteur et des limites
		// ici on doit ajouter les séances déjà_faites de la prescription
		const seancesGeneree =
			seancesAlreadyTarifed.length + indexOfSeance + prescription?.deja_faites
				? prescription.deja_faites
				: 0;
		console.log('seancesGeneree and indexOfSeance', seancesGeneree, indexOfSeance);
		const normalCodeLimit = architecture.seances_normales_executables - sp.deja_faites;
		console.log('normalCodeLimit', normalCodeLimit);
		const depassementCodeLimit =
			architecture.seances_en_depassement_executables +
			architecture.seances_normales_executables -
			sp.deja_faites;
		console.log('depassementCodeLimit', depassementCodeLimit);
		const depassement2CodeLimit =
			architecture.seances_normales_executables +
			architecture.seances_en_depassement_executables +
			architecture.seances_en_surdepassement_executables -
			sp.deja_faites;
		console.log('depassement2CodeLimit', depassement2CodeLimit);
		if (seancesGeneree < normalCodeLimit) {
			codeType = SEANCE_NORMALE;
		} else if (seancesGeneree < depassementCodeLimit) {
			codeType = DEPASSEMENT;
		} else if (seancesGeneree < depassement2CodeLimit) {
			codeType = DEPASSEMENT2;
		}
	} else if (seance.seance_type === SEANCE_CONSULTATIVE) {
		// Consultative
		codeType = EXAMEN_A_TITRE_CONSULTATIF;
	} else if (seance.seance_type === SEANCE_SECONDE) {
		// Seconde séance
		if (sp.groupe_id === 1 || sp.groupe_id === 6) {
			codeType = SECONDE_SEANCE;
		} else if (sp.groupe_id === 4) {
			// TODO Faut-il mettre un blocage ici pour éviter que le kiné puisse faire une erreur ?
			codeType = SECONDE_SEANCE;
			groupe_id = 2;
			duree = sp.metadata?.duree_ss_fa ?? seance.duree;
		}
	}
	// groupe_id: sp.groupe_id ?? seance.groupe_id,
	// duree: seance.duree,
	// lieu_id: seance.lieu_id,
	// patho_lourde_type: sp.patho_lourde_type,
	// patient,
	// seancesGeneree,
	// gmfcs: sp.gmfcs,
	// volet_h: sp.groupe_id === 5 && seance.duree === 3

	return convention.find((code) =>
		sqlQueryCompiler2({
			code,
			seance,
			groupe_id,
			codeType,
			duree,
			lieu_id: seance.lieu_id,
			patho_lourde_type: sp.patho_lourde_type,
			patient,
			seancesGeneree,
			gmfcs: sp.gmfcs,
			volet_h: sp.groupe_id === 5 && seance.duree === 3
		})
	);
}

export async function assignCodes({
	sp,
	seance,
	indexOfSeance,
	architecture,
	patient,
	convention_id,
	seancesGeneree
}) {
	let sqlAgreg;
	let queryCompilerArgs = {
		groupe_id: sp.groupe_id ?? seance.groupe_id,
		duree: seance.duree,
		lieu_id: seance.lieu_id,
		patho_lourde_type: sp.patho_lourde_type,
		patient,
		convention_id,
		seancesGeneree,
		gmfcs: sp.gmfcs,
		volet_h: sp.groupe_id === 5 && seance.duree === 3
	};
	if (seance.seance_type === SEANCE_KINE) {
		const seancesAlreadyTarifed = sp.seances.filter(
			(seance) => seance.has_been_attested && seance.seance_type === 0
		);
		console.log('seancesAlreadyTarifed', seancesAlreadyTarifed);

		// Définition du compteur et des limites
		const seancesGeneree = seancesAlreadyTarifed.length + indexOfSeance;
		console.log('seancesGeneree and indexOfSeance', seancesGeneree, indexOfSeance);
		const normalCodeLimit = architecture.seances_normales_executables - sp.deja_faites;
		console.log('normalCodeLimit', normalCodeLimit);
		const depassementCodeLimit =
			architecture.seances_en_depassement_executables +
			architecture.seances_normales_executables -
			sp.deja_faites;
		console.log('depassementCodeLimit', depassementCodeLimit);
		const depassement2CodeLimit =
			architecture.seances_normales_executables +
			architecture.seances_en_depassement_executables +
			architecture.seances_en_surdepassement_executables -
			sp.deja_faites;
		console.log('depassement2CodeLimit', depassement2CodeLimit);
		if (seancesGeneree < normalCodeLimit) {
			sqlAgreg = sqlQueryCompiler({ ...queryCompilerArgs, codeType: SEANCE_NORMALE });
		} else if (seancesGeneree < depassementCodeLimit) {
			sqlAgreg = sqlQueryCompiler({ ...queryCompilerArgs, codeType: DEPASSEMENT });
		} else if (seancesGeneree < depassement2CodeLimit) {
			sqlAgreg = sqlQueryCompiler({ ...queryCompilerArgs, codeType: DEPASSEMENT2 });
		}
	} else if (seance.seance_type === SEANCE_CONSULTATIVE) {
		// Consultative
		sqlAgreg = sqlQueryCompiler({
			...queryCompilerArgs,
			codeType: EXAMEN_A_TITRE_CONSULTATIF
		});
	} else if (seance.seance_type === SEANCE_SECONDE) {
		// Seconde séance
		if (sp.groupe_id === 1 || sp.groupe_id === 6) {
			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: SECONDE_SEANCE });
		} else if (sp.groupe_id === 4) {
			// TODO Faut-il mettre un blocage ici pour éviter que le kiné puisse faire une erreur ?
			sqlAgreg = await sqlQueryCompiler({
				...queryCompilerArgs,
				codeType: SECONDE_SEANCE,
				groupe_id: 2,
				duree: sp.metadata?.duree_ss_fa ?? seance.duree
			});

			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: SECONDE_SEANCE });
		}
	}
	console.log('sqlAgreg', sqlAgreg);

	if (sqlAgreg) {
		const [sqlStatement, sqlArgs] = sqlAgreg;
		const code = await appState.db.select(sqlStatement, sqlArgs);
		console.log('code', code);

		return code;
	} else {
		return { error: 'Aucun code trouvé' };
	}
}

function sqlQueryCompiler2({
	code,
	seance,
	groupe_id,
	codeType,
	duree,
	lieu_id,
	patho_lourde_type,
	patient,
	seancesGeneree,
	gmfcs,
	volet_h
} = {}) {
	//? Ensuite les données provenant du formulaire
	let sqlStatementArgs = [groupe_id, codeType, lieu_id];
	let sqlStatement =
		code.groupe === (groupe_id ?? seance.groupe_id) &&
		code.type === codeType &&
		code.lieu === seance.lieu_id;
	switch (groupe_id) {
		case 1:
			const defaultCase = () => {
				if ([4, 5, 8].includes(lieu_id)) {
					// 20min
					return sqlStatement && code.duree === 1;
				} else {
					// 30min
					return sqlStatement && code.duree === 2;
				}
			};
			switch (patho_lourde_type) {
				case 0:
					// 20 ou 30 min
					return defaultCase();
				case 1:
					// Si le patient est dans son 21ième anniversaire
					if (new Date().getFullYear() - new Date(patient.date_naissance).getFullYear() > 21) {
						if (gmfcs > 3) {
							if (seancesGeneree.length < 200) {
								return (
									sqlStatement &&
									code.duree === 4 &&
									code.drainage === false &&
									code.lourde_type === 1
								);
							} else {
								return defaultCase();
							}
						} else if (gmfcs > 1) {
							if (seancesGeneree.length < 150) {
								return (
									sqlStatement &&
									code.duree === 4 &&
									code.drainage === false &&
									code.lourde_type === 1
								);
							} else {
								return defaultCase();
							}
						} else {
							if (seancesGeneree.length < 100) {
								return (
									sqlStatement &&
									code.duree === 4 &&
									code.drainage === false &&
									code.lourde_type === 1
								);
							} else {
								return defaultCase();
							}
						}
					} else {
						return (
							sqlStatement && code.duree === 4 && code.drainage === false && code.lourde_type === 1
						);
					}
				case 2:
					// 60 min
					if (seancesGeneree.length < 120) {
						return sqlStatement && code.duree === 4 && code.drainage === true;
					} else {
						return defaultCase();
					}
				case 3:
					// 120 min
					if (seancesGeneree.length < 120) {
						return sqlStatement && code.duree === 5 && code.drainage === true;
					} else {
						return defaultCase();
					}
				case 4:
					// 45 min
					if (seancesGeneree.length < 50) {
						sqlStatementArgs.push(3);
						return sqlStatement && code.duree === 3;
					} else {
						return defaultCase();
					}
				case 5:
					if (seancesGeneree.length < 30) {
						return (
							code.lieu === seance.lieu_id &&
							code.duree === 4 &&
							code.drainage === false &&
							code.lourde_type === 4
						);
					} else {
						return defaultCase();
					}
			}
		default:
			//? En ajoutant, si nécessaire, la durée
			if (duree) {
				sqlStatement = sqlStatement && code.duree === duree;
			}
			if (volet_h) {
				sqlStatement = sqlStatement && code.drainage === true;
			}
			return sqlStatement;
	}
}

function sqlQueryCompiler({
	groupe_id,
	codeType,
	duree,
	lieu_id,
	patho_lourde_type,
	patient,
	convention_id,
	seancesGeneree,
	gmfcs,
	volet_h
} = {}) {
	//? Ensuite les données provenant du formulaire
	let sqlStatementArgs = [groupe_id, codeType, lieu_id];
	let sqlStatement = `SELECT * from codes WHERE groupe = $1 AND type = $2 AND lieu = $3 AND convention_id = '${convention_id}'`;
	switch (groupe_id) {
		case 1:
			const defaultCase = () => {
				if ([4, 5, 8].includes(lieu_id)) {
					// 20min
					sqlStatementArgs.push(1);
				} else {
					// 30min
					sqlStatementArgs.push(2);
				}
				return [`${sqlStatement} AND duree = $4;`, sqlStatementArgs];
			};
			switch (patho_lourde_type) {
				case 0:
					// 20 ou 30 min
					return defaultCase();
				case 1:
					// Si le patient est dans son 21ième anniversaire
					if (new Date().getFullYear() - new Date(patient.date_naissance).getFullYear() > 21) {
						if (gmfcs > 3) {
							if (seancesGeneree.length < 200) {
								sqlStatementArgs.push(4);
								sqlStatementArgs.push(false);
								sqlStatementArgs.push(1);
								return [
									`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`,
									sqlStatementArgs
								];
							} else {
								return defaultCase();
							}
						} else if (gmfcs > 1) {
							if (seancesGeneree.length < 150) {
								sqlStatementArgs.push(4);
								sqlStatementArgs.push(false);
								sqlStatementArgs.push(1);
								return [
									`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`,
									sqlStatementArgs
								];
							} else {
								return defaultCase();
							}
						} else {
							if (seancesGeneree.length < 100) {
								sqlStatementArgs.push(4);
								sqlStatementArgs.push(false);
								sqlStatementArgs.push(1);
								return [
									`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`,
									sqlStatementArgs
								];
							} else {
								return defaultCase();
							}
						}
					} else {
						sqlStatementArgs.push(4);
						sqlStatementArgs.push(false);
						sqlStatementArgs.push(1);
						return [
							`${sqlStatement} AND duree = $4 AND drainage = $5 AND lourde_type = $6;`,
							sqlStatementArgs
						];
					}
				case 2:
					// 60 min
					if (seancesGeneree.length < 120) {
						sqlStatementArgs.push(4);
						sqlStatementArgs.push(true);
						return [`${sqlStatement} AND duree = $4 AND drainage = $5;`, sqlStatementArgs];
					} else {
						return defaultCase();
					}
				case 3:
					// 120 min
					if (seancesGeneree.length < 120) {
						sqlStatementArgs.push(5);
						sqlStatementArgs.push(true);
						return [`${sqlStatement} AND duree = $4 AND drainage = $5;`, sqlStatementArgs];
					} else {
						return defaultCase();
					}
				case 4:
					// 45 min
					if (seancesGeneree.length < 50) {
						sqlStatementArgs.push(3);
						return [`${sqlStatement} AND duree = $4;`, sqlStatementArgs];
					} else {
						return defaultCase();
					}
				case 5:
					if (seancesGeneree.length < 30) {
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
			if (duree) {
				sqlStatementArgs.push(duree);
			}
			if (volet_h) {
				sqlStatementArgs.push(volet_h);
			}
			return [
				`${sqlStatement}${duree || duree ? ' AND duree = $4' : ''}${
					volet_h ? ` AND drainage = ${duree || duree ? '$5' : '$4'}` : ''
				};`,
				sqlStatementArgs
			];
	}
}
