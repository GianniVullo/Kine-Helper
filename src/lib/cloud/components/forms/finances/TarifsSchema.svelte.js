import { nullish, array, pipe, object } from 'valibot';
import { t } from '../../../../i18n';
import { goto } from '$app/navigation';
import { trace } from '@tauri-apps/plugin-log';
import { Formulaire } from '../../../libraries/formHandler.svelte';

import { appState } from '../../../../managers/AppState.svelte';
import { tarifUnitValidator } from '../tarification-fields/tarifHelpers';

// Tarifaction fields
const tarif_seance = nullish(tarifUnitValidator(true, 'custom'));
const tarif_indemnite = nullish(tarifUnitValidator(true, 'custom'));
const tarif_rapport_ecrit = nullish(tarifUnitValidator(true, 'custom'));
const tarif_consultatif = nullish(tarifUnitValidator(true, 'custom'));
const tarif_seconde_seance = nullish(tarifUnitValidator(true, 'custom'));
const tarif_intake = nullish(tarifUnitValidator(true, 'custom'));
const tarif_no_show = nullish(tarifUnitValidator(true, 'custom'));

const tarifs = nullish(array(tarifUnitValidator(false, 'custom')), []);

// Supplément field
const supplements = nullish(array(tarifUnitValidator()), []);

export const validateurs = {
	supplements,
	tarif_seance,
	tarif_indemnite,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarif_no_show,
	tarifs
};

export const TarifsSchema = pipe(
	object({
		...validateurs
	})
);

export async function onValid(data) {
	trace('In TarifsForm.onValid');
	/**
	 ** Ici trois cas de figures : ou bien le tarifs/suppléments existe déjà => update ou bien non => create ou bien y'a rien de changé => on fait rien
	 */

	for (const fieldKey of Object.keys(data)) {
		const field = data[fieldKey];
		const initialValue = this.initialValues[fieldKey];
		console.log('in loop with : ', fieldKey);

		if (Array.isArray(field)) {
			const { created, updated, deleted } = diffArrays(initialValue, $state.snapshot(field));
			for (const newEl of created) {
				let { error } = await appState.db.insert(fieldKey, newEl);
				if (error) {
					return (this.message = error);
				}
			}
			for (const updateEl of updated) {
				let { error } = await appState.db.update(fieldKey, [['id', updateEl.id]], updateEl);
				if (error) {
					return (this.message = error);
				}
			}
			for (const deleteEl of deleted) {
				let { error } = await appState.db.delete(fieldKey, [['id', deleteEl.id]]);
				if (error) {
					return (this.message = error);
				}
			}
			// TODO : condenser les opérations pour ne faire qu'un noeud d'historique avec cet onValid
		} else {
			//* Create
			if (!field.id && field.valeur) {
				field.id = crypto.randomUUID();
				let { error } = await appState.db.insert('tarifs', $state.snapshot(field));
				if (error) {
					return (this.message = error);
				}
			}
			//* Update
			if (field.id && field.valeur != initialValue.valeur) {
				let { error } = await appState.db.update(
					'tarifs',
					[['id', field.id]],
					$state.snapshot(field)
				);
				if (error) {
					return (this.message = error);
				}
			}
			//* Delete
			if (field.id && !field.valeur) {
				let { error } = await appState.db.delete('tarifs', [['id', field.id]]);
				if (error) {
					return (this.message = error);
				}
			}
		}
	}
	goto('/dashboard/finances');
}

function fieldsAreEqual(field, initialValue) {
	return (
		field?.id === initialValue?.id &&
		field?.nom === initialValue?.nom &&
		field?.valeur === initialValue?.valeur
	);
}

export const fieldSchema = [
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	}
];

function diffArrays(initialArray, currentArray, key = 'id') {
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

export async function getTarifs(error) {
	if (!appState.db) {
		await appState.init({});
	}

	let { data: tarifs, error: dbError } = await appState.db.select(
		`SELECT * FROM tarifs WHERE user_id = $1`,
		[appState.user.id]
	);

	let { data: supplements, error: dbError2 } = await appState.db.select(
		`SELECT * FROM supplements WHERE user_id = $1`,
		[appState.user.id]
	);
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

export async function buildTarifsFormHandler({ form_id, delaySetup }) {
	let {
		tarif_seance,
		tarif_indemnite,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarif_no_show,
		tarifs,
		supplements
	} = await getTarifs((status, error) => {
		trace('Error fetching tarifs:', error);
		console.error(status, { message: error });
	});
	return new Formulaire({
		validateurs,
		schema: TarifsSchema,
		submiter: '#tarifs-button',
		formElement: form_id,
		initialValues: {
			tarifs,
			supplements,
			tarif_seance: tarif_seance ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_seance',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_s: true })
			},
			tarif_indemnite: tarif_indemnite ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_indemnite',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_id: true })
			},
			tarif_rapport_ecrit: tarif_rapport_ecrit ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_rapport_ecrit',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_re: true })
			},
			tarif_consultatif: tarif_consultatif ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_consultatif',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_c: true })
			},
			tarif_seconde_seance: tarif_seconde_seance ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_seconde_seance',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_sec: true })
			},
			tarif_intake: tarif_intake ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_intake',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_in: true })
			},
			tarif_no_show: tarif_no_show ?? {
				id: null,
				user_id: appState.user.id,
				nom: 'tarif_no_show',
				valeur: null,
				created_at: now,
				metadata: JSON.stringify({ t_ns: true })
			}
		},
		onValid,
		delaySetup
	});
}
