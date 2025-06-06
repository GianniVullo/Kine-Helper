import { t } from '../../../../i18n';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { nombre_seance_trailing } from './prescriptionSnippets.svelte';
import {
	createPrescription,
	updatePrescription
} from '../../../../user-ops-handlers/prescriptions';
import {
	uuid,
	isoDate,
	nullish,
	number,
	pipe,
	transform,
	array as valibotArray,
	string,
	file as valibotFile,
	object as valibotObject
} from 'valibot';
import { inamiValidator, isoDateWithMessage, stringLengthMoreThan1 } from '../validators/commons';

export function buildPrescriptionSchema() {
	const user_id = uuid();
	const patient_id = uuid();
	const sp_id = uuid();
	const prescription_id = uuid();
	const created_at = isoDate();
	const date = isoDateWithMessage;
	const jointe_a = nullish(isoDate());
	const nombre_seance = nullish(number());
	const seance_par_semaine = nullish(number());
	const prescripteurNom = stringLengthMoreThan1;
	const prescripteurPrenom = stringLengthMoreThan1;
	const prescripteurInami = inamiValidator;
	const deja_faites = nullish(number());
	const file = pipe(
		transform((input) => {
			return input?.length === 0 ? null : input?.[0];
		}),
		nullish(valibotFile()),
		transform((input) => {
			return input?.length === 0 ? null : input?.[0];
		})
	);

	const froms = nullish(valibotArray(string()));
	const file_name = nullish(string());

	const validateurs = {
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
		file,
		file_name,
		froms,
		deja_faites
	};
	const PrescriptionSchema = pipe(
		valibotObject({
			...validateurs
		}),
		transform((input) => {
			input.prescripteur = {
				nom: input.prescripteurNom,
				prenom: input.prescripteurPrenom,
				inami: input.prescripteurInami
			};

			delete input.prescripteurNom;
			delete input.prescripteurPrenom;
			delete input.prescripteurInami;
			delete input.scans;
			return input;
		})
	);
	return { PrescriptionSchema, validateurs };
}

export async function onValid(data) {
	trace('In SPForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Prescription creation');
		// <!--* CREATE PROCEDURE -->
		let { data: prescription, error } = await createPrescription(
			data,
			$state.snapshot(this.form.file)?.[0]
		);
		// ça pourrait être cool d'implémenter un ssytème de toast qui notifie "l'élément a bien été enregistré"
		if (error) {
			return (this.message = error);
		}
		// TODO : Handle Error
		info('SP Creation done Successfully');
	} else {
		trace('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		const { error } = await updatePrescription(data, $state.snapshot(this.form.file)?.[0]);
		if (error) {
			return (this.message = error);
		}
		info('Patient modified done Successfully');
	}

	await invalidate('patient:layout');
	goto('/dashboard/patients/' + data.patient_id + '/situation-pathologique/' + data.sp_id);
}

export const fieldSchema = (mode) => [
	{
		id: 'file_name',
		name: 'file_name',
		inputType: 'hidden'
	},
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
		outerCSS: 'col-span-full sm:col-span-4',
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
		help: "Les prescripteurs terminant par '000' ne sont pas autorisés à faire des demandes d'accord",
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'nombre_seance',
		name: 'nombre_seance',
		inputType: 'number',
		titre: get(t)('form.prescription', 'nombre_seance.label'),
		help: null,
		outerCSS: 'col-span-3 sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'seance_par_semaine',
		name: 'seance_par_semaine',
		inputType: 'number',
		titre: get(t)('form.prescription', 'seance_par_semaine.label'),
		removeArrows: true,
		trailing: nombre_seance_trailing,
		help: null,
		outerCSS: 'col-span-3 sm:col-span-2',
		innerCSS: ''
	}
];

export const previousSeancesFields = [
	{
		id: 'jointe_a',
		name: 'jointe_a',
		inputType: 'date',
		titre: get(t)('form.prescription', 'jointe_a.label'),
		help: get(t)('form.prescription', 'jointe_a.help'),
		outerCSS: 'col-span-full md:col-span-3',
		innerCSS: ''
	},
	{
		id: 'deja_faites',
		name: 'deja_faites',
		inputType: 'number',
		titre: 'Séances déjà effectuées',
		help: 'Si vous reprenez le traitement et que le kiné précédent a déjà effectué des séances, mentionnez le nombre ici afin que Kiné Helper puisse attribuer les bons codes à vos séances',
		outerCSS: 'col-span-full md:col-span-3'
	}
];
