import * as v from 'valibot';
import { t } from '../../../../i18n';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { figuringConventionOut } from '../../../../stores/codeDetails';
import { appState } from '../../../../managers/AppState.svelte';
import { assignCodes, assignCodes2 } from '../../../../managers/CodeManager';
import { NomenclatureArchitecture } from '../../../../utils/nomenclatureManager';
import { convertToFloat, uuidRegex } from '../../../../utils/validationGenerics';
import { error as errorSvelte } from '@sveltejs/kit';
import { indmeniteCategory, INTAKE, RAPPORT_ECRIT } from '../../../../stores/codeDetails';
import { createAttestation } from '../../../../user-ops-handlers/attestations';

const user_id = v.uuid();
const patient_id = v.uuid();
const sp_id = v.uuid();
const prescription_id = v.uuid();
const attestation_id = v.uuid();
const date = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.isoDate()
);
// TODO Ajouter un numéro global ( ds la db pxlp) pour traquer les attestations
const created_at = v.pipe(v.string('Ce champ est obligatoire'), v.isoDate());
const porte_prescr = v.optional(v.boolean());
const has_been_printed = v.optional(v.boolean());
const generateFacturePatient = v.optional(v.boolean());
const printFacturePatient = v.optional(v.boolean());
const generateFactureMutuelle = v.optional(v.boolean());
const printFactureMutuelle = v.optional(v.boolean());
const numero_etablissement = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.string())
);
const service = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.string())
);
const total_recu = v.pipe(
	v.string(),
	v.regex(
		/^\d+(,\d{2})?$/,
		'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
	)
);
const valeur_totale = v.pipe(
	v.string(),
	v.regex(
		/^\d+(,\d{2})?$/,
		'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
	)
);
const mutuelle_paid = v.optional(v.boolean());
const patient_paid = v.optional(v.boolean());
const lines = v.array(
	v.object({
		id: v.number(),
		description: v.string(),
		date: v.string(),
		code: v.object({
			code_id: v.uuid(),
			code_reference: v.string(),
			honoraire: v.number(),
			remboursement: v.pipe(
				v.transform((input) => (typeof input === 'string' ? JSON.parse(input) : input))
			)
		}),
		valeur_totale: v.number(),
		total_recu: v.number(),
		seance_id: v.uuid()
	})
);
const seances = v.array(
	v.object({
		seance_id: v.uuid(),
		code_id: v.uuid(),
		metadata: v.object({
			valeur_totale: v.number(),
			total_recu: v.number()
		})
	})
);

const tiers_payant = v.optional(v.boolean());
const ticket_moderateur = v.optional(v.boolean());
const bim = v.optional(v.boolean());
const numero = v.pipe(
	v.number('Ce champ est obligatoire'),
	v.integer('Ce champ doit être un nombre')
);

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	prescription_id,
	attestation_id,
	date,
	created_at,
	porte_prescr,
	has_been_printed,
	generateFacturePatient,
	generateFactureMutuelle,
	printFacturePatient,
	printFactureMutuelle,
	total_recu,
	valeur_totale,
	mutuelle_paid,
	patient_paid,
	numero_etablissement,
	service,
	lines,
	tiers_payant,
	ticket_moderateur,
	bim,
	numero,
	seances
};

export const AttestationSchema = v.pipe(
	v.object({
		...validateurs
	}),
	v.transform((input) => {
		console.log('input = ', input);
		// si tiers_payant, la valeur de la facture mutuelle est le remboursement du code en fonction du statut patient et kiné
		let factureMutuelle_total = 0;
		for (const line of input.lines) {
			if (input.tiers_payant) {
				factureMutuelle_total += line.code.remboursement[INTER_MUTUELLE + queryBuilder(input.bim)];
			}
		}
		return {
			generateFacturePatient: input.generateFacturePatient,
			printFacturePatient: input.printFacturePatient,
			generateFactureMutuelle: input.generateFactureMutuelle,
			has_been_printed: input.has_been_printed,
			printFactureMutuelle: input.printFactureMutuelle,
			attestation: {
				user_id: input.user_id,
				patient_id: input.patient_id,
				sp_id: input.sp_id,
				prescription_id: input.prescription_id,
				attestation_id: input.attestation_id,
				created_at: input.created_at,
				date: input.date,
				porte_prescr: input.porte_prescr,
				has_been_printed: input.has_been_printed,
				numero_etablissement: input.numero_etablissement,
				service: input.service,
				total_recu: input.total_recu,
				valeur_totale: input.valeur_totale,
				mutuelle_paid: input.mutuelle_paid,
				patient_paid: input.patient_paid,
				numero: input.numero
			},
			facturePatient: {
				id: crypto.randomUUID(),
				user_id: input.user_id,
				patient_id: input.patient_id,
				sp_id: input.sp_id,
				date: input.date,
				type: 'patient',
				total: input.total_recu
			},
			factureMutuelle: {
				id: crypto.randomUUID(),
				user_id: input.user_id,
				patient_id: input.patient_id,
				sp_id: input.sp_id,
				date: input.date,
				type: 'mutuelle',
				total: factureMutuelle_total
			},
			seances: input.seances,
			lines: input.lines.map((line) => ({
				code_reference: line.code.code_reference,
				date: line.date
			}))
		};
	})
);

export async function onValid(data) {
	trace('In AttestationSchema.onValid');

	if (this.mode === 'create') {
		trace('Engaging Attestation creation');
		// <!--* CREATE PROCEDURE -->
		await createAttestation(data);
		info('Attestation Creation done Successfully');
	} else {
		trace('Engaging Attestation modification');
		// <!--* UPDATE PROCEDURE -->
		// TODO
		info('Attestation modified done Successfully');
	}
	await invalidate('patient:layout');

	goto(
		'/dashboard/patients/' +
			data.attestation.patient_id +
			'/situation-pathologique/' +
			data.attestation.sp_id +
			'/attestations'
	);
}

export const idFields = [
	{
		id: 'patient_id',
		name: 'patient_id',
		inputType: 'hidden'
	},
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	},
	{
		id: 'sp_id',
		name: 'sp_id',
		inputType: 'hidden'
	},

	{
		id: 'prescription_id',
		name: 'prescription_id',
		inputType: 'hidden'
	},

	{
		id: 'attestation_id',
		name: 'attestation_id',
		inputType: 'hidden'
	},
	{
		id: 'created_at',
		name: 'created_at',
		inputType: 'hidden'
	}
];

export const financeCheckboxSchema = [
	{
		id: 'mutuelle_paid',
		name: 'mutuelle_paid',
		inputType: 'checkbox',
		checkboxLabel: 'La mutuelle a déjà payé cette attestation',
		checkboxDescription: 'Ce champ ne modifie votre interface que pour les patients tiers payant',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},

	{
		id: 'patient_paid',
		name: 'patient_paid',
		inputType: 'checkbox',
		checkboxLabel: 'Le patient a déjà payé cette attestation',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	}
];

export const financeSchema = [
	{
		id: 'valeur_totale',
		name: 'valeur_totale',
		inputType: 'text',
		label: 'Valeur Totale',
		help: 'Ce champs ne figurera pas sur l attestation',
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'total_recu',
		name: 'total_recu',
		inputType: 'text',
		label: 'Total Reçu',
		help: 'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.',
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	}
];

export const actionFields = [
	{
		id: 'has_been_printed',
		name: 'has_been_printed',
		inputType: 'checkbox',
		checkboxLabel: "Imprimer l'attestation immédiatement",
		checkboxDescription:
			"Cochez cette case si vous souhaitez lancer l'impression de votre attestation immédiatement après son enregistrement dans la base de donnée.",
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	}
];

export const patient_field = [
	{
		id: 'generateFacturePatient',
		name: 'generateFacturePatient',
		inputType: 'checkbox',
		checkboxLabel: 'Générer la facture pour le patient',
		checkboxDescription: 'Une valeur par défaut peut être attribuée à ce champ via vos paramètres.',
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'printFacturePatient',
		name: 'printFacturePatient',
		inputType: 'checkbox',
		checkboxLabel: 'Imprimer la facture pour le patient',
		checkboxDescription:
			"Une valeur par défaut peut être attribuée à ce champ via vos paramètres. Attention, pour l'instant cette fonctionnalité ouvrira un pdf sur votre lecteur de pdf par défaut.",
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	}
];

export const mutuelleFields = [
	{
		id: 'generateFactureMutuelle',
		name: 'generateFactureMutuelle',
		inputType: 'checkbox',
		checkboxLabel: 'Générer la facture pour la mutuelle',
		checkboxDescription: 'Une valeur par défaut peut être attribuée à ce champ via vos paramètres.',
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'printFactureMutuelle',
		name: 'printFactureMutuelle',
		inputType: 'checkbox',
		checkboxLabel: 'Imprimer la facture pour la mutuelle',
		checkboxDescription:
			"Une valeur par défaut peut être attribuée à ce champ via vos paramètres. Attention, pour l'instant cette fonctionnalité ouvrira un pdf sur votre lecteur de pdf par défaut.",
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	}
];

export const fieldSchema = [
	{
		id: 'porte_prescr',
		name: 'porte_prescr',
		inputType: 'checkbox',
		checkboxLabel: 'La prescription est jointe à cette attestation',
		checkboxDescription: 'Cochez cette case si la prescription est jointe à cette attestation',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},
	{
		id: 'date',
		name: 'date',
		placeholder: "Date de l'attestation",
		inputType: 'date',
		titre: 'Date de l attestation',
		help: null,
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'numero',
		name: 'numero',
		inputType: 'number',
		titre: 'Numéro de l attestation',
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'numero_etablissement',
		name: 'numero_etablissement',
		inputType: 'text',
		titre: get(t)('sp.update', 'label.numero_etablissement'),
		help: 'Seulement si le patient est hospitalisé',
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'service',
		name: 'service',
		inputType: 'text',
		titre: get(t)('sp.update', 'label.service'),
		help: 'Seulement si le patient est hospitalisé',
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	}
];

export async function groupSeanceInAttestations(seancesToDealWith, spArg, patientArg, conventions) {
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
		console.log('Seance = ', seance);
		console.log('SP', sp);
		console.log('Patient', patient);
		let linesTaken = 1;
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
			console.log('seance.date = ', seance.date);
			console.log('conventions = ', conventions);
			let convention =
				conventions?.find((convention) => new Date(convention.created_at) <= new Date(seance.date))
					.codes || (await figuringConventionOut(seance.date, appState.db)).data;
			console.log('convention = ', convention);

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
				seancesGeneree: sp.seances.filter((s) => s.has_been_attested).length
			});
			console.log('code_seance = ', code_seance);
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
			if (
				patient.bim ||
				appState.user.conventionne ||
				!seance?.metadata?.t_s ||
				!sp?.metadata?.t_s ||
				!seance?.metadata?.t_sec ||
				!sp?.metadata?.t_sec
			) {
				valeur_totale_seance += code_seance.honoraire;
				total_recu_seance += computeTotalRecu(code_seance, patient);
			} else {
				let tarif =
					seance?.metadata?.t_s ||
					sp?.metadata?.t_s ||
					!seance?.metadata?.t_sec ||
					!sp?.metadata?.t_sec;
				if (!tarif) {
					const { data: fetchedTarif, error: fetchError } = await appState.db.select(
						`SELECT valeur FROM tarifs WHERE json_extract(metadata, '$.seance') is not null;`
					);
					if (fetchError) {
						console.error(fetchError);
						errorSvelte(500, { message: fetchError });
					}
					if (fetchedTarif.length > 0) {
						tarif = fetchedTarif[0].valeur;
					}
				} else {
					if (uuidRegex.test(tarif)) {
						const { data: fetchedTarif2, error: fetchError2 } = await appState.db.select(
							`SELECT valeur FROM tarifs WHERE id = $1;`,
							[tarif]
						);
						if (fetchError2) {
							console.error(fetchError2);
							errorSvelte(500, { message: fetchError2 });
						}
						if (fetchedTarif2.length > 0) {
							tarif = fetchedTarif2[0].valeur;
						}
					} else {
						tarif = convertToFloat(tarif);
					}
				}
				if (tarif) {
					tarif = convertToFloat(tarif);
					console.log('tarif = ', tarif, 'type = ', typeof tarif);

					valeur_totale_seance += tarif;
					// TODO Comment on fait ci en fait ?
					///? Est ce que le kiné peut faire un tiers payant et facturer des suppléments ?
					//? Réponse : Apparemment ce n'est pas précisé clairement donc les kinés ont le droit, si ils sont déconventionnés d'avoir des suppléments même si le patient est tiers payant
					if (patient.tiers_payant) {
						// donc ici il faut retirer l'intervention mutuelle du tarif
						total_recu_seance += tarif - computeTotalRecu(code_seance, patient);
					}
					total_recu_seance += tarif;
				} else {
					valeur_totale_seance += code_seance.honoraire;
					total_recu_seance += computeTotalRecu(code_seance, patient);
				}
			}
			metadataCode.kine = code_seance;
			if (seance.metadata?.intake) {
				const intake = convention.filter((c) => c.lieu === seance.lieu_id && c.type === INTAKE);
				console.log('intake = ', intake);
				intake.length !== 1 && errorSvelte(500, { message: "Pas de code trouvé pour l'intake" });
				console.log('intake = ', intake);
				valeur_totale_seance += intake[0].honoraire;
				total_recu_seance += computeTotalRecu(intake[0], patient);
				metadataCode.intake = intake[0];
				linesTaken++;
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
				const rapport_ecrit = convention.filter(
					(c) =>
						c.type === RAPPORT_ECRIT &&
						c.lieu_id === seance.lieu_id &&
						c.groupe_id === seance.groupe_id
				);
				rapport_ecrit.length !== 1 &&
					errorSvelte(500, { message: 'Pas de code trouvé pour le rapport écrit' });
				valeur_totale_seance += rapport_ecrit[0].honoraire;
				total_recu_seance += computeTotalRecu(rapport_ecrit[0], patient);
				metadataCode.rapport_ecrit = rapport_ecrit[0];
				linesTaken++;
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
				valeur_totale_seance += indemnite[0].honoraire;
				total_recu_seance += computeTotalRecu(indemnite[0], patient);
				metadataCode.indemnite = indemnite[0];
				linesTaken++;
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
					console.log('supplementValue = ', supplementValue);
					valeur_totale_seance += supplementValue;
					total_recu_seance += supplementValue;
				}
			}
			if (seance.metadata?.ss_p) {
				for (const { valeur } of seance.metadata.ss_p) {
					const supplementValue = convertToFloat(valeur);
					console.log('supplement_ponctuel_value = ', supplementValue);
					valeur_totale_seance += supplementValue;
					total_recu_seance += supplementValue;
				}
			}
			valeur_totale += valeur_totale_seance;
			total_recu += total_recu_seance;
			console.log('valeur_totale = ', valeur_totale);
			console.log('total_recu = ', total_recu);
			if (!seance.metadata) {
				seance.metadata = {};
			}
			seance.metadata.codes = metadataCode;
			seance.metadata.valeur_totale = valeur_totale_seance;
			seance.metadata.total_recu = total_recu_seance;
			seances.push(seance);
			lines.push({
				id: lineId,
				description: 'Séance',
				date: seance.date,
				code: code_seance,
				valeur_totale: valeur_totale_seance,
				total_recu: total_recu_seance,
				seance_id: seance.seance_id
			});
			lineId++;
			linesAvailable -= linesTaken;
			console.log('linesAvailable = ', linesAvailable);
		}
	}
	return { seances, valeur_totale, total_recu, lines };
}

const PART_PERSO = 'part_personnelle';
const INTER_MUTUELLE = 'intervention';

function queryBuilder(bim) {
	return `_${bim ? 'pref' : 'nopref'}_${appState.user.conventionne ? 'conv' : 'noconv'}`;
}

function computeTotalRecu(code, patient) {
	console.log('in computeTotalRecu with code = ', code);
	if (!patient.tiers_payant) {
		console.log('no tiers payant');
		return code.honoraire;
	}
	if (!patient.ticket_moderateur) {
		console.log('no ticket moderateur');
		return 0;
	}
	if (typeof code.remboursement === 'string') {
		code.remboursement = JSON.parse(code.remboursement);
	}

	const query = queryBuilder(patient.bim);
	console.log('query = ', query);
	const part_personnelle_du_patient = code.honoraire - code.remboursement[INTER_MUTUELLE + query];
	console.log(
		'part_personnelle_du_patient = ',
		part_personnelle_du_patient,
		code.honoraire,
		code.remboursement[INTER_MUTUELLE + query]
	);
	return part_personnelle_du_patient;
}
