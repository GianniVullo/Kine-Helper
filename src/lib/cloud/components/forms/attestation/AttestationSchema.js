import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createPatient, updatePatient } from '../../../../user-ops-handlers/patients';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';

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
	total_recu,
	valeur_totale,
	mutuelle_paid,
	patient_paid,
	numero_etablissement,
	service
};

export const AttestationSchema = v.pipe(
	v.object({
		...validateurs
	})
);

export async function onValid(data) {
	trace('In PatientForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Patient creation');
		// <!--* CREATE PROCEDURE -->
		await createPatient(data);
		info('Patient Creation done Successfully');
	} else {
		trace('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		await updatePatient(data);
		await invalidate('patient:layout');
		info('Patient modified done Successfully');
	}

	goto('/dashboard/patients/' + data.patient_id);
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

export const fieldSchema = [
	{
		id: 'has_been_printed',
		name: 'has_been_printed',
		inputType: 'checkbox',
		checkboxLabel: 'Imprimer',
		checkboxDescription:
			"Cochez cette case si vous souhaitez lancer l'impression de votre attestation immédiatement après son enregistrement dans la base de donnée.",
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'porte_prescr',
		name: 'porte_prescr',
		inputType: 'checkbox',
		checkboxLabel: 'La prescription est envoyée avec cette attestation',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},

	{
		id: 'mutuelle_paid',
		name: 'mutuelle_paid',
		inputType: 'checkbox',
		checkboxLabel: 'La mutuelle a déjà payé cette attestation',
		checkboxDescription: 'Ce champ ne modifie votre interface que pour les patients tiers payant',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},

	{
		id: 'patient_paid',
		name: 'patient_paid',
		inputType: 'checkbox',
		checkboxLabel: 'Le patient a déjà payé cette attestation',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},

	{
		id: 'date',
		name: 'date',
		inputType: 'date',
		placeholder: "Date de l'attestation",
		titre: 'Date',
		help: null,
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
