import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createSituationPathologique } from '../../../../user-ops-handlers/situations_pathologiques';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';

const tarifUnitValidator = v.object({
	id: v.uuid(),
	nom: v.string('Ce champ est obligatoire'),
	valeur: v.string('Ce champ est obligatoire'),
	created_at: v.isoDate(),
	user_id: v.uuid()
});

const user_id = v.pipe(v.nonNullable(v.string()), v.uuid());

// Tarifaction fields
const tarif_seance = v.nullish(tarifUnitValidator);
const tarif_indemnite_dplcmt = v.nullish(tarifUnitValidator);
const tarif_rapport_ecrit = v.nullish(tarifUnitValidator);
const tarif_consultatif = v.nullish(tarifUnitValidator);
const tarif_seconde_seance = v.nullish(tarifUnitValidator);
const tarif_intake = v.nullish(tarifUnitValidator);
const tarifs_custom = v.nullish(v.array(tarifUnitValidator), []);

// Supplément field
const supplements = v.nullish(v.array(tarifUnitValidator), []);

export const validateurs = {
	user_id,
	supplements,
	tarif_seance,
	tarif_indemnite_dplcmt,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarifs_custom
};

export const TarifsSchema = v.pipe(
	v.object({
		...validateurs
	})
	// v.transform((input) => {
	// 	input.metadata = {};
	// 	if (input.tarif_seance) {
	// 		input.metadata.tarif_seance = input.tarif_seance;
	// 	}
	// 	if (input.tarif_indemnite_dplcmt) {
	// 		input.metadata.tarif_indemnite_dplcmt = input.tarif_indemnite_dplcmt;
	// 	}
	// 	if (input.tarif_rapport_ecrit) {
	// 		input.metadata.tarif_rapport_ecrit = input.tarif_rapport_ecrit;
	// 	}
	// 	if (input.tarif_consultatif) {
	// 		input.metadata.tarif_consultatif = input.tarif_consultatif;
	// 	}
	// 	if (input.tarif_seconde_seance) {
	// 		input.metadata.tarif_seconde_seance = input.tarif_seconde_seance;
	// 	}
	// 	if (input.tarif_intake) {
	// 		input.metadata.tarif_intake = input.tarif_intake;
	// 	}

	// 	if (Object.keys(input.metadata).length === 0) {
	// 		input.metadata = null;
	// 	}
	// 	delete input.tarif_seance;
	// 	delete input.tarif_indemnite_dplcmt;
	// 	delete input.tarif_rapport_ecrit;
	// 	delete input.tarif_consultatif;
	// 	delete input.tarif_seconde_seance;
	// 	delete input.tarif_intake;
	// 	return input;
	// })
);

export async function onValid(data) {
	trace('In TarifsForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging SP creation');
		// <!--* CREATE PROCEDURE -->
		await createSituationPathologique(data);
		info('SP Creation done Successfully');
	} else {
		trace('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		// await updatePatient(data);
		await invalidate('patient:layout');
		info('Patient modified done Successfully');
	}

	goto('/dashboard/patients/' + data.patient_id + '/situation-pathologique/' + data.sp_id);
}

export const fieldSchema = [
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	}
];
