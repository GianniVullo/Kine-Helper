import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createSituationPathologique } from '../../../../user-ops-handlers/situations_pathologiques';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';

const user_id = v.pipe(v.nonNullable(v.string()), v.uuid());

// Tarifaction fields
const tarif_seance = v.nullish(v.string());
const tarif_indemnite_dplcmt = v.nullish(v.string());
const tarif_rapport_ecrit = v.nullish(v.string());
const tarif_consultatif = v.nullish(v.string());
const tarif_seconde_seance = v.nullish(v.string());
const tarif_intake = v.nullish(v.string());
const tarif_custom = v.nullish(
	v.array(
		v.object({
			id: v.uuid(),
			nom: v.string('Ce champ est obligatoire'),
			valeur: v.string('Ce champ est obligatoire'),
			created_at: v.isoDate(),
			user_id: v.uuid()
		})
	),
	[]
);

// Supplément field
const supplements = v.nullish(
	v.array(
		v.object({
			id: v.uuid(),
			nom: v.string('Ce champ est obligatoire'),
			valeur: v.string('Ce champ est obligatoire'),
			created_at: v.isoDate(),
			user_id: v.uuid()
		})
	),
	[]
);

export const validateurs = {
	user_id,
	supplements,
	tarif_seance,
	tarif_indemnite_dplcmt,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarif_custom
};

export const SPSchema = v.pipe(
	v.object({
		...validateurs
	}),
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
		id: 'created_id',
		name: 'created_id',
		inputType: 'hidden'
	},
	{
		id: 'motif',
		name: 'motif',
		inputType: 'text',
		placeholder: get(t)('sp.detail', 'reason.label'),
		titre: get(t)('sp.detail', 'reason'),
		help: null,
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'plan_du_ttt',
		name: 'plan_du_ttt',
		inputType: 'textarea',
		placeholder: get(t)('sp.detail', 'plan.label'),
		titre: get(t)('sp.detail', 'plan'),
		help: null,
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'numero_etablissement',
		name: 'numero_etablissement',
		inputType: 'text',
		placeholder: get(t)('sp.update', 'label.numero_etablissement'),
		titre: get(t)('sp.update', 'label.numero_etablissement'),
		help: 'Seulement si le patient est hospitalisé',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'service',
		name: 'service',
		inputType: 'text',
		placeholder: get(t)('sp.update', 'label.service'),
		titre: get(t)('sp.update', 'label.service'),
		help: 'Seulement si le patient est hospitalisé',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	}
];
