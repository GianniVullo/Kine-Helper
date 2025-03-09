import { pipe, string, regex, object, transform, nullish, isoDate, uuid } from 'valibot';
import { error } from '@sveltejs/kit';
import { appState } from '../../../../managers/AppState.svelte';

function assignRelevantTarif(value, id) {
	const parsedMetadata = JSON.parse(value.metadata);
	if (parsedMetadata) {
		return parsedMetadata[id];
	}
}

function evalTarifDefaultValue(metadata, key, subKey, tarifs) {
	if (!metadata || !metadata[key]) {
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
		tarif_seance: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_seance',
			'id',
			tarifs
		),
		tarif_indemnite: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_indemnite',
			'id',
			tarifs
		),
		tarif_rapport_ecrit: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_rapport_ecrit',
			'id',
			tarifs
		),
		tarif_consultatif: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_consultatif',
			'id',
			tarifs
		),
		tarif_seconde_seance: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_seconde_seance',
			'id',
			tarifs
		),
		tarif_intake: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_intake',
			'id',
			tarifs
		),
		tarif_no_show: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_no_show',
			'id',
			tarifs
		),
		tarif_seance_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_seance',
			'valeur',
			tarifs
		),
		tarif_indemnite_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_indemnite',
			'valeur',
			tarifs
		),
		tarif_rapport_ecrit_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_rapport_ecrit',
			'valeur',
			tarifs
		),
		tarif_consultatif_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_consultatif',
			'valeur',
			tarifs
		),
		tarif_seconde_seance_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_seconde_seance',
			'valeur',
			tarifs
		),
		tarif_intake_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_intake',
			'valeur',
			tarifs
		),
		tarif_no_show_custom: evalTarifDefaultValue(
			seance?.metadata ?? sp?.metadata,
			'tarif_no_show',
			'valeur',
			tarifs
		),
		supplements: sp?.metadata?.supplements ?? []
	};
}

export const tarifUnitValidator = (e, name) => {
	const numericalString = pipe(
		string('Ce champs est obligatoire'),
		regex(
			/^\d+(,\d{2})?$/,
			'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
		)
	);
	if (name == 'custom') {
		return object({
			id: e ? nullish(uuid()) : uuid(),
			nom: string('Ce champ est obligatoire'),
			valeur: e
				? pipe(
						transform((input) => (input?.length == 0 ? null : input)),
						nullish(numericalString)
					)
				: numericalString,
			created_at: isoDate(),
			user_id: uuid(),
			metadata: string()
		});
	}
	return object({
		id: e ? nullish(uuid()) : uuid(),
		nom: string('Ce champ est obligatoire'),
		valeur: e ? nullish(numericalString) : numericalString,
		created_at: isoDate(),
		user_id: uuid()
	});
};

export function modelingMetadata(input) {
	/**
	 ** un uuid si c'est un tarifs pré-défini et un nombre si c'est un tarif custom
	 */
	input.metadata = {};
	if (input.tarif_seance || input.tarif_seance_custom) {
		input.metadata.tarif_seance = input.tarif_seance ?? input.tarif_seance_custom;
	}
	if (input.tarif_indemnite || input.tarif_indemnite_custom) {
		input.metadata.tarif_indemnite = input.tarif_indemnite ?? input.tarif_indemnite_custom;
	}
	if (input.tarif_rapport_ecrit || input.tarif_rapport_ecrit_custom) {
		input.metadata.tarif_rapport_ecrit =
			input.tarif_rapport_ecrit ?? input.tarif_rapport_ecrit_custom;
	}
	if (input.tarif_consultatif || input.tarif_consultatif_custom) {
		input.metadata.tarif_consultatif = input.tarif_consultatif ?? input.tarif_consultatif_custom;
	}
	if (input.tarif_seconde_seance || input.tarif_seconde_seance_custom) {
		input.metadata.tarif_seconde_seance =
			input.tarif_seconde_seance ?? input.tarif_seconde_seance_custom;
	}
	if (input.tarif_intake || input.tarif_intake_custom) {
		input.metadata.tarif_intake = input.tarif_intake ?? input.tarif_intake_custom;
	}
	if (input.tarif_no_show || input.tarif_no_show_custom) {
		input.metadata.tarif_no_show = input.tarif_no_show ?? input.tarif_no_show_custom;
	}
	if (input.supplements.length > 0) {
		input.metadata.supplements = input.supplements;
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
	return input;
}

export async function gatherTarifsforpageLoad(sp_id) {
	let { data: tarifs, error: dbError } = await appState.db.select(
		`SELECT * FROM tarifs WHERE user_id = $1`,
		[appState.user.id]
	);

	let { data: supplements, error: dbError2 } = await appState.db.select(
		`SELECT * FROM supplements WHERE user_id = $1`,
		[appState.user.id]
	);

	let { data: prescriptions, error: dbError3 } = await appState.db.select(
		`SELECT * FROM prescriptions WHERE user_id = $1 AND sp_id = $2`,
		[appState.user.id, sp_id]
	);
	if (dbError || dbError2 || dbError3) {
		error(500, { message: dbError + dbError2 + dbError3 });
	}
	prescriptions = prescriptions.map((p) => {
		p.prescripteur = JSON.parse(p.prescripteur);
		return p;
	});
	return { tarifs, supplements, prescriptions };
}
