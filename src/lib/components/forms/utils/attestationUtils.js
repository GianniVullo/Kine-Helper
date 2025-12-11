import { figuringConventionOut } from '../../../stores/codeDetails';
import { appState } from '../../../managers/AppState.svelte';
import { assignCodes2 } from '../../../managers/CodeManager';
import { NomenclatureArchitecture } from '../../../utils/nomenclatureManager';
import { convertToFloat, uuidRegex } from '../../../utils/validationGenerics';
import { error as errorSvelte } from '@sveltejs/kit';
import { indmeniteCategory, INTAKE, RAPPORT_ECRIT } from '../../../stores/codeDetails';
import dayjs from 'dayjs';
import { info } from '../../../cloud/libraries/logging';

export async function groupSeanceInAttestations(
	seancesToDealWith,
	spArg,
	patientArg,
	conventions,
	prescription
) {
	let sp = spArg;
	let patient = patientArg;
	if (!sp) {
		sp = await appState.db.retrieve_sp(seancesToDealWith[0].sp_id);
	}
	if (!patient) {
		patient = await appState.db.select('SELECT * FROM patients WHERE patient_id = $1;', [
			seancesToDealWith[0].patient_id
		]);
	}
	let linesAvailable = 20;
	let lineId = 1;
	let valeur_totale = 0;
	let total_recu = 0;
	let seances = [];
	let lines = [];
	for (const seance of seancesToDealWith) {
		info('Seance = ', seance);
		let linesTaken = 1;
		if (seance.metadata?.intake) linesTaken++;
		if (seance.rapport_ecrit) linesTaken++;
		if (seance.indemnite) linesTaken++;
		if (seance.metadata?.ss) linesTaken += seance.metadata.ss.length;
		if (linesAvailable >= linesTaken) {
			/**
			 ** Assignation de la nomeclature :
			 ** 	- On commence par fetcher la convention la plus récente
			 ** 	- On fetch le ou les codes qui correspondent à la séance
			 ** 	- On ajoute un dictionnaires de codes à séance.metadata
			 **		- On calcule la valeur totale et le total recu
			 */
			let valeur_totale_seance = 0;
			let total_recu_seance = 0;
			info('seance.date = ', seance.date);
			let convention =
				conventions?.find((convention) => new Date(convention.created_at) <= new Date(seance.date))
					.codes || (await figuringConventionOut(seance.date, appState.db)).data;

			/**
			 * * Changement de plan, on va utiliser le code manager pour fetch le code.
			 ** 	- On fetch le convention_id
			 ** 	- On envoie les données nécessaire à CodeManager.assignCodes
			 **		- On récupère les codes
			 **		- On les ajoute à la séance
			 **		- On passe à la suite
			 *
			 * */
			const metadataCode = {};
			const code_seance = assignCodes2({
				prescription,
				sp,
				seance,
				indexOfSeance: seancesToDealWith.indexOf(seance),
				architecture: new NomenclatureArchitecture(patient, {
					groupe_id: sp.groupe_id ?? seance.groupe_id,
					duree: seance.duree,
					lieu_id: seance.lieu_id,
					patho_lourde_type: sp.patho_lourde_type,
					patient,
					gmfcs: sp.gmfcs,
					volet_j: sp.metadata?.volet_j,
					volet_h: sp.groupe_id === 5 && seance.duree === 3
				}),
				patient,
				convention,
				// Pour les seances générées c'est important de filtrer par année pour les sp qui se redémarre chaque année.
				seancesGeneree: sp.seances.filter((s) => {
					switch (sp.groupe_id) {
						case (0, 5):
							return s.has_been_attested && dayjs(s.date).year() === dayjs().year();
						default:
							return s.has_been_attested && dayjs(s.date).year() === dayjs().year();
					}
				}).length
			});
			info('code_seance = ', code_seance);
			!code_seance && errorSvelte(500, { message: 'Pas de code trouvé pour la séance' });
			/**
			 ** ici On ajoute les valeurs dans valeur_totale_seance et total_recu_seance
			 ** 	- Si le patient est BIM ou le kiné conventionné on prends la valeur du code
			 ** 	- Si le kiné est déconventionné :
			 **			- on essaie de prendre la valeur du tarif sur la séance,
			 **			- sinon on essaie de le prendre sur la sp,
			 **			- sinon on essaye de prendre dans les paramètres généraux (table tarif dans la db)
			 **			- sinon on prends la valeur du code
			 */
			/**
			 * Enfait ce serait plus intelligent de commencer par le kiné déconventionné
			 * - Il faut d'abord une fonction qui détermine le tarif
			 */

			let { vt, tr } = await valeurIncrementor({
				code: code_seance,
				patient,
				seance,
				sp,
				tarif_name:
					seance.seance_type === 0
						? 't_s'
						: seance.seance_type === 1
							? 't_c'
							: seance.seance_type === 2
								? 't_sec'
								: null,
				valeur_totale_seance,
				total_recu_seance
			});
			console.log('Incrementing for ', vt, tr);
			valeur_totale_seance += vt;
			total_recu_seance += tr;
			info('code_seance = ', code_seance);
			metadataCode.kine = code_seance;
			if (seance.metadata?.intake) {
				const intake = convention.filter((c) => c.lieu === seance.lieu_id && c.type === INTAKE);
				info('intake = ', intake);
				intake.length !== 1 && errorSvelte(500, { message: "Pas de code trouvé pour l'intake" });
				info('intake = ', intake);
				let { vt, tr } = await valeurIncrementor({
					code: intake[0],
					patient,
					seance,
					sp,
					tarif_name: 't_in',
					valeur_totale_seance,
					total_recu_seance
				});
				valeur_totale_seance += vt;
				total_recu_seance += tr;
				metadataCode.intake = intake[0];
				lines.push({
					id: lineId,
					description: 'Intake',
					date: seance.date,
					code: intake[0],
					valeur_totale: intake[0].honoraire,
					total_recu: computeTotalRecu(intake[0], patient),
					seance_id: seance.seance_id
				});
				lineId++;
			}
			if (seance.rapport_ecrit) {
				info(
					'seance.rapport_ecrit = ',
					convention.filter((c) => c.type === RAPPORT_ECRIT)
				);
				info('seance.données =', seance.lieu_id, seance.groupe_id);

				const rapport_ecrit = convention.filter(
					(c) =>
						c.type === RAPPORT_ECRIT && c.lieu === seance.lieu_id && c.groupe === seance.groupe_id
				);
				rapport_ecrit.length !== 1 &&
					errorSvelte(500, { message: 'Pas de code trouvé pour le rapport écrit' });
				let { vt, tr } = await valeurIncrementor({
					code: rapport_ecrit[0],
					patient,
					seance,
					sp,
					tarif_name: 't_re',
					valeur_totale_seance,
					total_recu_seance
				});
				valeur_totale_seance += vt;
				total_recu_seance += tr;
				metadataCode.rapport_ecrit = rapport_ecrit[0];
				lines.push({
					id: lineId,
					description: 'Rapport écrit',
					date: seance.date,
					code: rapport_ecrit[0],
					valeur_totale: rapport_ecrit[0].honoraire,
					total_recu: computeTotalRecu(rapport_ecrit[0], patient),
					seance_id: seance.seance_id
				});
				lineId++;
			}
			if (seance.indemnite) {
				const indemnite = convention.filter(
					(c) => c.code_reference === indmeniteCategory[sp.groupe_id ?? seance.groupe_id]
				);

				indemnite.length !== 1 &&
					errorSvelte(500, { message: "Pas de code trouvé pour l'indemnité" });
				let { vt, tr } = await valeurIncrementor({
					code: indemnite[0],
					patient,
					seance,
					sp,
					tarif_name: 't_id',
					valeur_totale_seance,
					total_recu_seance
				});
				valeur_totale_seance += vt;
				total_recu_seance += tr;
				metadataCode.indemnite = indemnite[0];
				lines.push({
					id: lineId,
					description: 'Indemnité',
					date: seance.date,
					code: indemnite[0],
					valeur_totale: indemnite[0].honoraire,
					total_recu: computeTotalRecu(indemnite[0], patient),
					seance_id: seance.seance_id
				});
				lineId++;
			}
			// TODO Ajouter les suppléments et aussi prendre en compte si il y a un tarif personnalisé
			if (seance.metadata?.ss) {
				for (const supplement_id of seance.metadata.ss) {
					const { data: supplements, error: supplError } = await appState.db.select(
						`SELECT * FROM supplements WHERE id = $1;`,
						[supplement_id]
					);
					supplements.length !== 1 && errorSvelte(500, { message: 'Pas trouvé le supplément' });
					supplError && errorSvelte(500, { message: supplError });
					const supplement = supplements[0];
					const supplementValue = convertToFloat(supplement.valeur);
					info('supplementValue = ', supplementValue);
					valeur_totale_seance += supplementValue;
					total_recu_seance += supplementValue;
				}
			}
			// Supplement ponctuel
			if (seance.metadata?.ss_p) {
				for (const { valeur } of seance.metadata.ss_p) {
					const supplementValue = convertToFloat(valeur);
					info('supplement_ponctuel_value = ', supplementValue);
					valeur_totale_seance += supplementValue;
					total_recu_seance += supplementValue;
				}
			}
			info('valeur_totale_seance = ', valeur_totale_seance);
			info('total_recu_seance = ', total_recu_seance);
			valeur_totale += valeur_totale_seance;
			total_recu += total_recu_seance;
			info('valeur_totale = ', valeur_totale);
			info('total_recu = ', total_recu);
			if (!seance.metadata) {
				seance.metadata = {};
			}
			seance.metadata.codes = metadataCode;
			seance.metadata.valeur_totale = code_seance.honoraire;
			seance.metadata.total_recu = total_recu_seance;
			seances.push(seance);
			lines.push({
				id: lineId,
				description: 'Séance',
				date: seance.date,
				code: code_seance,
				valeur_totale: code_seance.honoraire,
				total_recu: patient.tiers_payant
					? computeTotalRecu(code_seance, patient)
					: code_seance.honoraire,
				seance_id: seance.seance_id
			});
			lineId++;
			linesAvailable -= linesTaken;
			info('linesAvailable = ', linesAvailable);
		}
	}
	return { seances, valeur_totale, total_recu, lines };
}

export const PART_PERSO = 'part_personnelle';
export const INTER_MUTUELLE = 'intervention';

export async function retrieveTarif(tarifName, tarif) {
	console.log('In retrieveTarif', tarifName, tarif);
	if (!tarif) {
		const { data: fetchedTarif, error: fetchError } = await appState.db.select(
			`SELECT valeur FROM tarifs WHERE json_extract(metadata, '$.${tarifName}') is not null;`
		);
		if (fetchError) {
			console.error('ERROR FETCHING TARIFS', fetchError);
			errorSvelte(500, { message: fetchError });
		}
		if (fetchedTarif.length > 0) {
			tarif = convertToFloat(fetchedTarif[0].valeur);
		}
	} else {
		if (uuidRegex.test(tarif)) {
			console.log('THE TARIF IS a UUID');
			const { data: fetchedTarif2, error: fetchError2 } = await appState.db.select(
				`SELECT valeur FROM tarifs WHERE id = $1;`,
				[tarif]
			);
			console.log('The fetched tarifs ', fetchedTarif2);
			if (fetchError2) {
				console.error('ERROR FETCHING TARIFS', fetchError2);
				errorSvelte(500, { message: fetchError2 });
			}
			if (fetchedTarif2.length > 0) {
				tarif = convertToFloat(fetchedTarif2[0].valeur);
			} else {
				return null;
			}
		} else {
			try {
				tarif = convertToFloat(tarif);
			} catch (error) {
				return null;
			}
		}
	}
	return tarif;
}

export function queryBuilder(bim) {
	return `_${bim ? 'pref' : 'nopref'}_${appState.user.conventionne ? 'conv' : 'noconv'}`;
}

export function computeTotalRecu(code, patient) {
	info('in computeTotalRecu with code = ', code);
	if (!patient.tiers_payant) {
		info('no tiers payant');
		return code.honoraire;
	}
	if (!patient.ticket_moderateur) {
		info('no ticket moderateur');
		return 0;
	}
	if (typeof code.remboursement === 'string') {
		code.remboursement = JSON.parse(code.remboursement);
	}

	const query = queryBuilder(patient.bim);
	info('query = ', query);
	const part_personnelle_du_patient = code.honoraire - code.remboursement[INTER_MUTUELLE + query];
	info(
		'part_personnelle_du_patient = ',
		part_personnelle_du_patient,
		code.honoraire,
		code.remboursement[INTER_MUTUELLE + query]
	);
	return part_personnelle_du_patient;
}

export async function valeurIncrementor({ code, patient, seance, sp, tarif_name }) {
	console.log('IN VALEUR INCREMENTOR WITH ', tarif_name);
	if (tarif_name === null) {
		errorSvelte(500, { message: 'Pas de tarif trouvé pour la séance' });
	}
	let valeur_totale_seance = 0;
	let total_recu_seance = 0;
	if (!appState.user.conventionne && !patient.bim) {
		let tarif = seance?.metadata?.[tarif_name] || sp?.metadata?.[tarif_name];
		tarif = await retrieveTarif(tarif_name, tarif);
		console.log('TARIF CUZ DECONVENTION ', tarif);
		if (tarif) {
			code.honoraire = tarif;
			valeur_totale_seance += tarif;
			if (patient.tiers_payant) {
				total_recu_seance += computeTotalRecu(code, patient);
			} else {
				total_recu_seance += tarif;
			}
		} else {
			valeur_totale_seance += code.honoraire;
			if (patient.tiers_payant) {
				total_recu_seance += computeTotalRecu(code, patient);
			} else {
				total_recu_seance += code.honoraire;
			}
		}
	} else {
		valeur_totale_seance += code.honoraire;
		if (patient.tiers_payant) {
			total_recu_seance += computeTotalRecu(code, patient);
		} else {
			total_recu_seance += code.honoraire;
		}
	}
	return { vt: valeur_totale_seance, tr: total_recu_seance };
}
