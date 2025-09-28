import { pipe, string, object, transform, nullish, isoDate } from 'valibot';
import { error } from '@sveltejs/kit';
import { appState } from '../../../managers/AppState.svelte.js';
import { uuidVal, numericalStringPrimitive } from '../validators/baseValidators';
import { supabase } from '../../../stores/supabaseClient';

function assignRelevantTarif(value, id) {
	const parsedMetadata = JSON.parse(value.metadata);
	if (parsedMetadata) {
		return parsedMetadata[id];
	}
}

function evalTarifDefaultValue(metadata, key, subKey, tarifs) {
	if (!metadata || !metadata[key]) {
		console.log('no metadata', tarifs, key);
		return tarifs.find((t) => assignRelevantTarif(t, key))?.[subKey];
	} else {
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (uuidRegex.test(metadata[key])) {
			return tarifs.find((t) => t.id === metadata[key])?.[subKey];
		} else {
			return metadata[key];
		}
	}
}

export function getTarificationInitialValues(sp, tarifs, seance) {
	return {
		tarif_seance: evalTarifDefaultValue(seance?.metadata ?? sp?.metadata, 't_s', 'id', tarifs),
		tarif_indemnite: evalTarifDefaultValue(seance?.metadata ?? sp?.metadata, 't_id', 'id', tarifs),
		tarif_rapport_ecrit: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_re',
			'id',
			tarifs
		),
		tarif_consultatif: evalTarifDefaultValue(seance?.metadata ?? sp?.metadata, 't_c', 'id', tarifs),
		tarif_seconde_seance: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_sec',
			'id',
			tarifs
		),
		tarif_intake: evalTarifDefaultValue(seance?.metadata ?? sp?.metadata, 't_in', 'id', tarifs),
		tarif_no_show: evalTarifDefaultValue(seance?.metadata ?? sp?.metadata, 't_ns', 'id', tarifs),
		tarif_seance_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_s',
			'valeur',
			tarifs
		),
		tarif_indemnite_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_id',
			'valeur',
			tarifs
		),
		tarif_rapport_ecrit_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_re',
			'valeur',
			tarifs
		),
		tarif_consultatif_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_c',
			'valeur',
			tarifs
		),
		tarif_seconde_seance_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_sec',
			'valeur',
			tarifs
		),
		tarif_intake_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_in',
			'valeur',
			tarifs
		),
		tarif_no_show_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			't_ns',
			'valeur',
			tarifs
		),
		supplements: sp?.metadata?.ss ?? []
	};
}

export const tarifUnitValidator = (e, name) => {
	if (name == 'custom') {
		return object({
			id: e ? nullish(uuidVal()) : uuidVal(),
			nom: string('Ce champ est obligatoire'),
			valeur: e
				? pipe(
						transform((input) => (input?.length == 0 ? null : input)),
						nullish(numericalStringPrimitive())
					)
				: numericalStringPrimitive(),
			created_at: isoDate(),
			user_id: uuidVal(),
			metadata: string()
		});
	}
	return object({
		id: e ? nullish(uuidVal()) : uuidVal(),
		nom: string('Ce champ est obligatoire'),
		valeur: e ? nullish(numericalStringPrimitive()) : numericalStringPrimitive(),
		created_at: isoDate(),
		user_id: uuidVal()
	});
};

export function modelingMetadata(input) {
	/**
	 ** un uuid si c'est un tarifs pré-défini et un nombre si c'est un tarif custom
	 */
	input.metadata = {};
	if (input.tarif_seance || input.tarif_seance_custom) {
		input.metadata.t_s = input.tarif_seance ?? input.tarif_seance_custom;
	}
	if (input.tarif_indemnite || input.tarif_indemnite_custom) {
		input.metadata.t_id = input.tarif_indemnite ?? input.tarif_indemnite_custom;
	}
	if (input.tarif_rapport_ecrit || input.tarif_rapport_ecrit_custom) {
		input.metadata.t_re = input.tarif_rapport_ecrit ?? input.tarif_rapport_ecrit_custom;
	}
	if (input.tarif_consultatif || input.tarif_consultatif_custom) {
		input.metadata.t_c = input.tarif_consultatif ?? input.tarif_consultatif_custom;
	}
	if (input.tarif_seconde_seance || input.tarif_seconde_seance_custom) {
		input.metadata.t_sec = input.tarif_seconde_seance ?? input.tarif_seconde_seance_custom;
	}
	if (input.tarif_intake || input.tarif_intake_custom) {
		input.metadata.t_in = input.tarif_intake ?? input.tarif_intake_custom;
	}
	if (input.tarif_no_show || input.tarif_no_show_custom) {
		input.metadata.t_ns = input.tarif_no_show ?? input.tarif_no_show_custom;
	}
	if (input.supplements?.length > 0) {
		input.metadata.ss = input.supplements;
	}

	delete input.supplements;
	delete input.tarif_seance;
	delete input.tarif_indemnite;
	delete input.tarif_rapport_ecrit;
	delete input.tarif_consultatif;
	delete input.tarif_seconde_seance;
	delete input.tarif_intake;
	delete input.tarif_seance_custom;
	delete input.tarif_indemnite_custom;
	delete input.tarif_rapport_ecrit_custom;
	delete input.tarif_consultatif_custom;
	delete input.tarif_seconde_seance_custom;
	delete input.tarif_intake_custom;
	delete input.tarif_no_show_custom;
	delete input.tarif_no_show;
	return input;
}

export async function gatherTarifsforpageLoad(sp_id) {
	let { data: tarifs, error: dbError } = await supabase
		.from('tarifs')
		.select()
		.eq('organization_id', appState.selectedOrg.id)
		.eq('user_id', appState.user.id);

	let { data: supplements, error: dbError2 } = await supabase
		.from('supplements')
		.select()
		.eq('organization_id', appState.selectedOrg.id)
		.eq('user_id', appState.user.id);

	let { data: prescriptions, error: dbError3 } = await supabase
		.from('prescriptions')
		.select()
		.eq('organization_id', appState.selectedOrg.id)
		.eq('user_id', appState.user.id)
		.eq('sp_id', sp_id);
	if (dbError || dbError2 || dbError3) {
		error(500, { message: dbError + dbError2 + dbError3 });
	}
	prescriptions = prescriptions.map((p) => {
		p.prescripteur = JSON.parse(p.prescripteur);
		return p;
	});
	return { tarifs, supplements, prescriptions };
}

export async function getTarifs(error) {
	if (!appState.db) {
		await appState.init({});
	}

	let { data: tarifs, error: dbError } = await supabase
		.from('tarifs')
		.select()
		.eq('organization_id', appState.selectedOrg.id)
		.eq('user_id', appState.user.id);

	let { data: supplements, error: dbError2 } = await supabase
		.from('supplements')
		.select()
		.eq('organization_id', appState.selectedOrg.id)
		.eq('user_id', appState.user.id);

	if (dbError || dbError2) {
		error(500, { message: dbError + dbError2 });
	}
	let tarif_seance = tarifs.find((t) => JSON.parse(t.metadata)?.t_s);
	let tarif_indemnite = tarifs.find((t) => JSON.parse(t.metadata)?.t_id);
	let tarif_rapport_ecrit = tarifs.find((t) => JSON.parse(t.metadata)?.t_re);
	let tarif_consultatif = tarifs.find((t) => JSON.parse(t.metadata)?.t_c);
	let tarif_seconde_seance = tarifs.find((t) => JSON.parse(t.metadata)?.t_sec);
	let tarif_intake = tarifs.find((t) => JSON.parse(t.metadata)?.t_in);
	let tarif_no_show = tarifs.find((t) => JSON.parse(t.metadata)?.t_ns);
	let tarifs_custom = tarifs.filter((t) => JSON.parse(t.metadata)?.custom);
	let data = {
		tarif_seance,
		tarif_indemnite,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarif_no_show,
		tarifs: tarifs_custom,
		supplements
	};

	return data;
}

function fieldsAreEqual(field, initialValue) {
	return (
		field?.id === initialValue?.id &&
		field?.nom === initialValue?.nom &&
		field?.valeur === initialValue?.valeur
	);
}

/**
 * Compares two arrays of objects and returns the differences.
 * @param {Array} initialArray
 * @param {Array} currentArray
 * @param {string} key
 * @returns {{ created: Array, updated: Array, deleted: Array }}
 */
export function diffArrays(initialArray, currentArray, key = 'id') {
	const initialMap = new Map(initialArray.map((item) => [item[key], item]));
	const currentMap = new Map(currentArray.map((item) => [item[key], item]));

	const created = [];
	// TODO: Ici ce serait bien de définir le champs qui a été modifié pour n'envoyer que ça au serveur. J'ai pas le temps de faire ça pour l'instant mais ce serait bien d'y arriver un moment. C'est, à priori, sans danger pour nos API.
	const updated = [];
	const deleted = [];

	for (const [id, currItem] of currentMap) {
		if (!initialMap.has(id)) {
			created.push(currItem);
		} else if (!fieldsAreEqual(initialMap.get(id), currItem)) {
			updated.push(currItem);
		}
	}

	for (const [id, initItem] of initialMap) {
		if (!currentMap.has(id)) {
			deleted.push(initItem);
		}
	}

	return { created, updated, deleted };
}
