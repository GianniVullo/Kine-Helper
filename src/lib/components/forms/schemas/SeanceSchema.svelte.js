import {
	pipe,
	transform,
	transformAsync,
	nullish,
	number,
	isoDate,
	picklist,
	boolean,
	array,
	object,
	forwardAsync,
	pipeAsync
} from 'valibot';
import { appState } from '$lib/managers/AppState.svelte';
import { modelingMetadata, tarifUnitValidator } from '../utils/tarifHelpers';
import { cloneDeep, isEqual } from 'lodash';
import { Seance } from '$lib/user-ops-handlers/models';
import {
	isoDateWithMessage,
	isoTimeWithMessage,
	multipleSeanceMinLengthValidator,
	numericalString,
	seanceSameDayValidator,
	seanceTypes,
	uuidVal
} from '../validators/baseValidators';
import { page } from '$app/state';
import dayjs from 'dayjs';
import { getTarificationInitialValues } from '../utils/tarifHelpers';
import { duree_int } from '../../../stores/codeDetails';

function defineDuree(duree, patho_lourde_type, lieu_id) {
	if (duree) {
		return duree_int(duree);
	}
	if (patho_lourde_type) {
		switch (patho_lourde_type) {
			case 0:
				if ([0, 1, 2, 3, 7].includes(lieu_id)) {
					return 30;
				}
				return 20;
			case 1 || 2:
				return 60;
			case 3:
				return 120;
			case 4:
				return 45;
			case 5:
				return null;
			default:
				break;
		}
	}
	if (patho_lourde_type === 5) {
		return 60;
	}
	return 30;
}

export const payment_methods = [null, 'cash', 'carte', 'virement', 'qrCode'];

const modeChoices = ['create', 'update'];

const user_id = uuidVal();
const patient_id = uuidVal();
const sp_id = uuidVal();
const prescription_id = uuidVal();
const seance_id = uuidVal();
const date = pipe(
	transform((input) => (input?.length === 0 ? null : input)),
	isoDateWithMessage()
);

//* start and custom durée
const start = pipe(
	transform((input) => (input?.length === 0 ? null : input)),
	isoTimeWithMessage()
);
const duree = number();
const lieu_id = number();
const duree_custom = number();
const created_at = isoDate();
const seanceType = nullish(picklist(seanceTypes), 'kiné');
const mode = picklist(modeChoices);
const indemnite = boolean();
const ticket_moderateur = boolean();
const rapport_ecrit = nullish(boolean());
const intake = nullish(boolean());
const groupe_id = nullish(number());
const patho_lourde_type = nullish(number());
const is_paid = boolean();
const payment_method = nullish(picklist(payment_methods));

// Tarifaction fields
const supplements = nullish(array(uuidVal()));
const supplements_ponctuels = nullish(array(tarifUnitValidator()));

const tarif_seance = nullish(uuidVal());
const tarif_indemnite = nullish(uuidVal());
const tarif_rapport_ecrit = nullish(uuidVal());
const tarif_consultatif = nullish(uuidVal());
const tarif_seconde_seance = nullish(uuidVal());
const tarif_intake = nullish(uuidVal());
const tarif_no_show = nullish(uuidVal());
const tarif_seance_custom = numericalString();
const tarif_indemnite_custom = numericalString();
const tarif_rapport_ecrit_custom = numericalString();
const tarif_consultatif_custom = numericalString();
const tarif_seconde_seance_custom = numericalString();
const tarif_intake_custom = numericalString();
const tarif_no_show_custom = numericalString();

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	prescription_id,
	seance_id,
	created_at,
	date,
	start,
	duree,
	lieu_id,
	duree_custom,
	ticket_moderateur,
	seanceType,
	indemnite,
	rapport_ecrit,
	intake,
	duree,
	groupe_id,
	patho_lourde_type,
	supplements,
	supplements_ponctuels,
	tarif_seance,
	tarif_indemnite,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarif_seance_custom,
	tarif_indemnite_custom,
	tarif_rapport_ecrit_custom,
	tarif_consultatif_custom,
	tarif_seconde_seance_custom,
	tarif_intake_custom,
	tarif_no_show,
	tarif_no_show_custom,
	mode,
	is_paid,
	payment_method,
	organization_id: uuidVal()
};

export const seance_prototype_validateur = {
	user_id,
	patient_id,
	sp_id,
	prescription_id,
	created_at,
	duree,
	lieu_id,
	duree_custom,
	ticket_moderateur,
	indemnite,
	rapport_ecrit,
	intake,
	duree,
	groupe_id,
	patho_lourde_type,
	supplements,
	supplements_ponctuels,
	tarif_seance,
	tarif_indemnite,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarif_seance_custom,
	tarif_indemnite_custom,
	tarif_rapport_ecrit_custom,
	tarif_consultatif_custom,
	tarif_seconde_seance_custom,
	tarif_intake_custom,
	tarif_no_show,
	tarif_no_show_custom,
	mode,
	is_paid,
	payment_method
};

function refineSeance(input) {
	modelingMetadata(input);
	if (input.seanceType === 'kiné') {
		delete input.metadata.tarif_consultatif;
		delete input.metadata.tarif_seconde_seance;
	} else if (input.seanceType === 'consult') {
		delete input.metadata.tarif_seance;
		delete input.metadata.tarif_seconde_seance;
	} else if (input.seanceType === 'consult') {
		delete input.metadata.tarif_consultatif;
		delete input.metadata.tarif_seance;
	}
	if (input.supplements_ponctuels.length > 0) {
		input.metadata.ss_p = input.supplements_ponctuels.map((sup) => {
			return { nom: sup.nom, valeur: sup.valeur };
		});
	}
	delete input.supplements_ponctuels;
	if (input.intake) {
		input.metadata.intake = input.intake;
	}

	let duree_normale = defineDuree(input.duree, input.patho_lourde_type, input.lieu_id);
	if (!duree_normale || duree_normale !== input.duree_custom) {
		input.metadata.duree_custom = input.duree_custom;
	}
	input.seance_type = seanceTypes.indexOf(input.seanceType);
	delete input.seanceType;
	if (Object.keys(input.metadata).length === 0) {
		input.metadata = null;
	}

	if (input.payment_method) {
		input.payment_method = payment_methods.indexOf(input.payment_method);
	} else {
		delete input.payment_method;
	}
	delete input.duree_custom;
	delete input.tarif_no_show;
	delete input.tarif_no_show_custom;
	delete input.intake;
	delete input.mode;
	return input;
}

export const SeanceSchema = pipeAsync(
	object({
		...validateurs
	}),
	//! pour l'instant je préfère qu'on passe seulement des warnings et que l'on ne fasse de blocage stricte car il y a toujours ce cas de figure en patho lourde ou le kiné peut aller voir le patient plus de deux fois par jour...
	forwardAsync(seanceSameDayValidator(), ['date']),
	transformAsync(async (input) => {
		let mode = input.mode;
		let seance = refineSeance(input);
		if (mode === 'update') {
			// If the seance is being updated, we need to check if the metadata has changed so that we reduce the payload sent to the server.
			const currentSeance = new Seance(
				(
					await appState.db.select('SELECT * FROM seances WHERE seance_id = $1', [seance.seance_id])
				).data[0]
			);
			if (isEqual(currentSeance.metadata, seance.metadata)) {
				delete seance.metadata;
			}
			if (currentSeance.seance_type === seance.seance_type) {
				delete seance.seance_type;
			}
		}
		return seance;
	})
);

export const MultipleSeancesSchema = pipeAsync(
	object({
		seance_prototype: object(seance_prototype_validateur),
		seances: pipe(
			array(
				object({
					seance_id,
					seanceType,
					start,
					date
				})
			),
			multipleSeanceMinLengthValidator()
		)
	}),
	// Assemble the seances array from the prototype and the seances Array
	transform((input) => {
		console.log('input in first transform', input);
		let seances = input.seances.map((seance) => {
			let newSeance = cloneDeep(input.seance_prototype);
			if (newSeance.is_paid && newSeance.payment_method) {
				newSeance.payment_method = newSeance.payment_method;
			}

			newSeance.date = seance.date;
			newSeance.start = seance.start;
			newSeance.seanceType = seance.seanceType;
			newSeance.seance_id = seance.seance_id;
			delete newSeance.intake;
			delete newSeance.rapport_ecrit;
			return newSeance;
		});
		console.log('seances', seances);
		if (input.seance_prototype.intake) {
			console.log('input.seance_prototype.intake', input.seance_prototype.intake);
			seances[0] = { ...seances[0], intake: input.seance_prototype.intake };
		}
		if (input.seance_prototype.rapport_ecrit) {
			seances[0].rapport_ecrit = input.seance_prototype.rapport_ecrit;
		}
		input = { seances };
		return input;
	}),
	// Validate the seances array
	object({ seances: array(object(validateurs)) }),
	transform((input) => {
		return input.seances.map((seance) => refineSeance(seance));
	})
);

export function initialSeanceValues({ patient, sp, seance, prescriptions, tarifs, mode }) {
	const tarifMetadata = getTarificationInitialValues(sp, tarifs, seance);
	let fromCalendarDate = page.url.searchParams.get('date');
	let now = dayjs().format('YYYY-MM-DD');
	return {
		user_id: appState.user.id,
		patient_id: patient.patient_id,
		sp_id: sp.sp_id,
		prescription_id:
			(seance?.prescription_id ?? prescriptions.length === 1)
				? prescriptions[0].prescription_id
				: null,
		duree: seance?.duree ?? sp.duree,
		seanceType:
			typeof seance?.seance_type === 'number' ? seanceTypes[seance.seance_type] : undefined,
		lieu_id: seance?.lieu_id ?? sp?.lieu_id,
		start: seance?.start,
		duree_custom:
			seance?.metadata?.duree_custom ?? defineDuree(sp.duree, sp.patho_lourde_type, sp.lieu_id),
		seance_id: seance?.seance_id ?? crypto.randomUUID(),
		created_at: seance?.created_at ?? now,
		date: seance?.date ?? fromCalendarDate ?? now,
		ticket_moderateur: seance?.ticket_moderateur ?? patient.ticket_moderateur ?? true,
		indemnite: seance?.indemnite ?? (sp.lieu_id === 3 || sp.groupe_id === 6 ? true : false),
		rapport_ecrit: seance?.rapport_ecrit ?? false,
		intake: seance?.metadata?.intake ?? false,
		supplements_ponctuels:
			seance?.metadata?.supplements_ponctuels?.map((s) => ({
				id: undefined,
				user_id: undefined,
				created_at: undefined,
				nom: s.nom,
				valeur: s.valeur
			})) ?? [],
		groupe_id: sp.groupe_id,
		patho_lourde_type: sp.patho_lourde_type,
		mode,
		...tarifMetadata,
		supplements: seance?.metadata?.supplements ?? [],
		is_paid: seance?.is_paid ?? false,
		payment_method: seance?.payment_method ?? null,
		organization_id: appState.selectedOrg.id
	};
}
