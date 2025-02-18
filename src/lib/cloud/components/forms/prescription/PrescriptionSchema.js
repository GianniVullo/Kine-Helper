import * as v from 'valibot';
import { t } from '../../../../i18n';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { nombre_seance_trailing } from './prescriptionSnippets.svelte';
import { appState } from '../../../../managers/AppState.svelte';
import { page } from '$app/state';
import { createPrescription } from '../../../../user-ops-handlers/prescriptions';

const user_id = v.pipe(v.nonNullable(v.string()), v.uuid());
const patient_id = v.pipe(v.optional(v.string()), v.uuid());
const sp_id = v.pipe(v.optional(v.string()), v.uuid());
const prescription_id = v.pipe(v.optional(v.string()), v.uuid());
const created_at = v.isoDate();
const date = v.isoDate();
const jointe_a = v.nullable(v.isoDate());
const nombre_seance = v.nullable(v.number());
const seance_par_semaine = v.nullable(v.number());
const prescripteurNom = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.nonEmpty('Veuillez insérer un nom')
);
const prescripteurPrenom = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.nonEmpty('Veuillez insérer au moins une initiale')
);
const prescripteurInami = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.nonEmpty('Veuillez insérer le n°INAMI du prescripteur')
);
const file = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input[0])),
	v.nullable(v.file())
);

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	created_at,
	prescription_id,
	date,
	jointe_a,
	nombre_seance,
	seance_par_semaine,
	prescripteurNom,
	prescripteurPrenom,
	prescripteurInami,
	file
};

export const PrescriptionSchema = v.pipe(
	v.object({
		user_id,
		patient_id,
		sp_id,
		created_at,
		prescription_id,
		date,
		jointe_a,
		nombre_seance,
		seance_par_semaine,
		prescripteur: v.object({
			nom: prescripteurNom,
			prenom: prescripteurPrenom,
			inami: prescripteurInami
		})
	})
);

export async function onValid(data) {
	trace('In SPForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Prescription creation');
		// <!--* CREATE PROCEDURE -->
		const { patient, sp } = page.data;
		let compiledData = {
			prescription: data,
			filePath: `${appState.user.id}/patient-${
				patient.patient_id
			}/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions`,
			fileName: data.prescription_id,
			buffer: Array.from(await this.form.file.bytes())
		};
		await createPrescription(compiledData);
		// TODO : Handle Error
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
		id: 'prescription_id',
		name: 'prescription_id',
		inputType: 'hidden'
	},
	{
		id: 'created_id',
		name: 'created_id',
		inputType: 'hidden'
	},
	{
		id: 'date',
		name: 'date',
		inputType: 'date',
		placeholder: get(t)('form.prescription', 'date.label'),
		titre: get(t)('form.prescription', 'date.label'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'prescripteurNom',
		name: 'prescripteurNom',
		inputType: 'text',
		placeholder: 'Maison',
		titre: get(t)('form.prescription', 'prescripteurfield.name'),
		help: null,
		outerCSS: 'col-span-full md:col-span-3',
		innerCSS: ''
	},
	{
		id: 'prescripteurPrenom',
		name: 'prescripteurPrenom',
		inputType: 'text',
		placeholder: 'Grégory',
		titre: get(t)('form.prescription', 'prescripteurfield.surname'),
		help: null,
		outerCSS: 'col-span-full md:col-span-3',
		innerCSS: ''
	},
	{
		id: 'prescripteurInami',
		name: 'prescripteurInami',
		inputType: 'text',
		placeholder: get(t)('form.prescription', 'prescripteurfield.inami'),
		titre: get(t)('form.prescription', 'prescripteurfield.inami'),
		help: null,
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'nombre_seance',
		name: 'nombre_seance',
		inputType: 'number',
		titre: get(t)('form.prescription', 'nombre_seance.label'),
		removeArrows: true,
		trailing: nombre_seance_trailing,
		help: null,
		outerCSS: 'sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'seance_par_semaine',
		name: 'seance_par_semaine',
		inputType: 'number',
		titre: get(t)('form.prescription', 'seance_par_semaine.label'),
		help: null,
		outerCSS: 'sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'jointe_a',
		name: 'jointe_a',
		inputType: 'date',
		titre: get(t)('form.prescription', 'jointe_a.label'),
		help: get(t)('form.prescription', 'jointe_a.help'),
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'file',
		name: 'file',
		inputType: 'file',
		titre: get(t)('form.prescription', 'copy.label'),
		outerCSS: 'sm:col-span-full'
		// innerCSS: ''
	}
];
