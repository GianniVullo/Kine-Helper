import * as v from 'valibot';
import { createSeance } from '../../../../user-ops-handlers/seances';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { appState } from '../../../../managers/AppState.svelte';

const seanceTypes = ['kiné', 'consult', 'seconde'];

const user_id = v.pipe(v.nonNullable(v.string()), v.uuid());
const patient_id = v.pipe(v.optional(v.string()), v.uuid());
const sp_id = v.pipe(v.optional(v.string()), v.uuid());
const seance_id = v.pipe(v.optional(v.string()), v.uuid());
const date = v.isoDate();
const indemnite = v.pipe(v.optional(v.boolean()));
const rapport_ecrit = v.pipe(v.optional(v.boolean()));
const intake = v.pipe(v.optional(v.boolean()));
const seanceType = v.nullish(v.picklist(seanceTypes), 'kiné');
const groupe_id = v.nullish(v.number());
const patho_lourde_type = v.nullish(v.number());

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	seance_id,
	date,
	seanceType,
	indemnite,
	rapport_ecrit,
	intake,
	groupe_id,
	patho_lourde_type
};

export const SeanceSchema = v.pipe(
	v.object({
		...validateurs
	}),
	//! pour l'instant je préfère qu'on passe seulement des warnings et que l'on ne fasse de blocage stricte car il y a toujours ce cas de figure en patho lourde ou le kiné peut aller voir le patient plus de deux fois par jour...
	v.forward(
		v.partialCheckAsync(
			[['date']],
			async (input) => {
				let { data, error } = await appState.db.select(
					'SELECT * FROM seances WHERE date(date) = $1 AND sp_id === $2',
					[input.date, input.sp_id]
				);
				if (error) {
					return false;
				}
				if (
					data.length > 1 &&
					typeof input.groupe_id === 'number' &&
					input.groupe_id !== 1 &&
					typeof input.patho_lourde_type === 'number' &&
					input.patho_lourde_type !== 5
				) {
					return false;
				}
				return true;
			},
			'Il y a déjà 2 séances ce jour là !'
		),
		['date']
	),
	v.transform((input) => {
		input.metadata = {};
		if (input.indemnite) {
			input.metadata.indemnite = input.indemnite;
		}
		if (input.rapport_ecrit) {
			input.metadata.rapport_ecrit = input.rapport_ecrit;
		}
		if (input.intake) {
			input.metadata.intake = input.intake;
		}

		if (Object.keys(input.metadata).length === 0) {
			input.metadata = null;
		}

		delete input.indemnite;
		delete input.rapport_ecrit;
		delete input.intake;
		return input;
	})
);

export async function onValid(data) {
	trace('In SeanceForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Seance creation');
		// <!--* CREATE PROCEDURE -->
		await createSeance(data);
		info('Seance Creation done Successfully');
	} else {
		trace('Engaging Seance modification');
		// <!--* UPDATE PROCEDURE -->
		// await updateSeance(data);
		await invalidate('seance:layout');
		info('Seance modification done Successfully');
	}

	goto('/dashboard/patients/' + data.patient_id + '/seances/' + data.seance_id);
}

export const idFieldSchema = [
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
		id: 'seance_id',
		name: 'seance_id',
		inputType: 'hidden'
	}
];

export const dateField = {
	id: 'date',
	name: 'date',
	inputType: 'date',
	placeholder: 'Date de la séance',
	titre: 'Date',
	help: null,
	outerCSS: 'col-span-full sm:col-span-2',
	innerCSS: ''
};

export const checkboxesFields = [
	{
		id: 'indemnite',
		name: 'indemnite',
		inputType: 'checkbox',
		checkboxLabel: 'Indemnité de déplacement',
		checkboxDescription:
			"Cochez cette case si la séance était à domicile. Attention, si vous traitez deux patients au même domicile vous ne pouvez compter l'indemnité qu'une seule fois",
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'rapport_ecrit',
		name: 'rapport_ecrit',
		inputType: 'checkbox',
		checkboxLabel: 'Rapport écrit',
		checkboxDescription:
			'Indique si vous avez effectué un rapport écrit. <br /> Les groupes PATHOLOGIE COURANTE, PALLIATIF et HOPITAL DE JOUR ne peuvent pas compter de rapport écrit',
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'intake',
		name: 'intake',
		inputType: 'checkbox',
		checkboxLabel: 'Intake',
		checkboxDescription:
			'Compter un intake. Attention une fois par an/par patient.<br /> UNIQUEMENT POUR LA PATHOLOGIE COURANTE',
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	}
];
