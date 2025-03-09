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
import Database from '@tauri-apps/plugin-sql';
import { error } from '@sveltejs/kit';
import { appState } from './AppState.svelte';

/**
 ** C'est quoi le plan en fait...
 **   Il faut qu'on puisse donner des cades aux séances... Pour ça il faut savoir toutes les séances qui ont été déjà tarifée dans la sp. puis y ajouter
 */

export async function assignCodes(sp, seance, indexOfSeance, architecture) {
	let sqlAgreg;
	let queryCompilerArgs = {
		groupe_id: sp.groupe_id,
		duree: seance.duree,
		lieu_id: seance.lieu_id,
		patho_lourde_type: sp.patho_lourde_type,
		patient,
		convention,
		seancesGeneree,
		gmfcs: sp.gmfcs,
		volet_h: sp.groupe_id === 5 && duree === 3
	};
	if (seance.code_type === 0) {
		const seancesAlreadyTarifed = sp.seances.filter((seance) => seance.has_been_attested);
		const seancesGeneree = seancesAlreadyTarifed.length + indexOfSeance;
		if (seancesGeneree < architecture.seances_normales_executables - sp.deja_faites) {
			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: SEANCE_NORMALE });
		} else if (
			seancesGeneree <
			architecture.seances_en_depassement_executables +
				architecture.seances_normales_executables -
				sp.deja_faites
		) {
			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: DEPASSEMENT });
		} else if (
			seancesGeneree <
			architecture.seances_normales_executables +
				architecture.seances_en_depassement_executables +
				architecture.seances_en_surdepassement_executables -
				sp.deja_faites
		) {
			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: DEPASSEMENT2 });
		}
	} else if (seance.code_type === 1) {
		// Consultative
		sqlAgreg = await sqlQueryCompiler({
			...queryCompilerArgs,
			codeType: EXAMEN_A_TITRE_CONSULTATIF
		});
	} else if (seance.code_type === 2) {
		// Seconde séance
		if (sp.groupe_id === 1 || sp.groupe_id === 6) {
			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: SECONDE_SEANCE });
		} else if (sp.groupe_id === 4) {
			// TODO Faut-il mettre un blocage ici pour éviter que le kiné puisse faire une erreur ?
			sqlAgreg = await sqlQueryCompiler({
				...queryCompilerArgs,
				codeType: SECONDE_SEANCE,
				groupe_id: 2,
				duree: seance.duree
			});

			sqlAgreg = await sqlQueryCompiler({ ...queryCompilerArgs, codeType: SECONDE_SEANCE });
		}
	}
	if (sqlAgreg) {
		const [sqlStatement, sqlArgs] = sqlAgreg;
		const code = await appState.db.select(sqlStatement, sqlArgs);
		return code;
	} else {
		return { error: 'Aucun code trouvé' };
	}
}

async function sqlQueryCompiler({
	groupe_id,
	codeType,
	duree,
	lieu_id,
	patho_lourde_type,
	patient,
	convention,
	seancesGeneree,
	gmfcs,
	volet_h
} = {}) {
	//? Ensuite les données provenant du formulaire
	let sqlStatementArgs = [groupe_id, codeType, lieu_id];
	let sqlStatement = `SELECT * from codes WHERE groupe = $1 AND type = $2 AND lieu = $3 AND convention_id = '${convention.convention_id}'`;
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
