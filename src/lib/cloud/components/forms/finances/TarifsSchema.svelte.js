import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createSituationPathologique } from '../../../../user-ops-handlers/situations_pathologiques';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { getModalStore } from '@skeletonlabs/skeleton';
import { appState } from '../../../../managers/AppState.svelte';

const tarifUnitValidator = (e, name) => {
	const numericalString = v.pipe(
		v.string('Ce champs est obligatoire'),
		v.regex(
			/^\d+(,\d{2})?$/,
			'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
		)
	);
	if (name == 'custom') {
		return v.object({
			id: e ? v.nullish(v.uuid()) : v.uuid(),
			nom: v.string('Ce champ est obligatoire'),
			valeur: e
				? v.pipe(
						v.transform((input) => (input?.length == 0 ? null : input)),
						v.nullish(numericalString)
					)
				: numericalString,
			created_at: v.isoDate(),
			user_id: v.uuid(),
			metadata: v.string()
		});
	}
	return v.object({
		id: e ? v.nullish(v.uuid()) : v.uuid(),
		nom: v.string('Ce champ est obligatoire'),
		valeur: e ? v.nullish(numericalString) : numericalString,
		created_at: v.isoDate(),
		user_id: v.uuid()
	});
};

// Tarifaction fields
const tarif_seance = v.nullish(tarifUnitValidator(true, 'custom'));
const tarif_indemnite = v.nullish(tarifUnitValidator(true, 'custom'));
const tarif_rapport_ecrit = v.nullish(tarifUnitValidator(true, 'custom'));
const tarif_consultatif = v.nullish(tarifUnitValidator(true, 'custom'));
const tarif_seconde_seance = v.nullish(tarifUnitValidator(true, 'custom'));
const tarif_intake = v.nullish(tarifUnitValidator(true, 'custom'));
const tarifs = v.nullish(v.array(tarifUnitValidator(false, 'custom')), []);

// Supplément field
const supplements = v.nullish(v.array(tarifUnitValidator()), []);

export const validateurs = {
	supplements,
	tarif_seance,
	tarif_indemnite,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarifs
};

export const TarifsSchema = v.pipe(
	v.object({
		...validateurs
	})
);

export async function onValid(data) {
	trace('In TarifsForm.onValid');
	console.log(data, this.initialValues);
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
