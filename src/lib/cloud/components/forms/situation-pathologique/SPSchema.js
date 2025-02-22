import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createSituationPathologique } from '../../../../user-ops-handlers/situations_pathologiques';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { groupes, lieux } from '../../../../stores/codeDetails';

const SEX = ['F', 'M'];

const user_id = v.pipe(v.nonNullable(v.string()), v.uuid());
const patient_id = v.pipe(v.optional(v.string()), v.uuid());
const sp_id = v.pipe(v.optional(v.string()), v.uuid());
const created_at = v.isoDate();
const motif = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.minWords(1, 'Veuillez insérer un nom')
);
const plan_du_ttt = v.nullable(v.string());
const numero_etablissement = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.string())
);
const service = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.string())
);

// Tarifaction fields
const supplements = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.array(v.uuid()))
);

// The nomenclature fields
// Ces champs peuvent être nul ici et dans la création de séance mais pas dans la génération d'attestation

const groupe_id = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.number())
);
const lieu_id = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.number())
);
const duree_id = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.number())
);
const patho_lourde_type = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(v.number())
);
const gmfcs = v.nullable(v.number());
const has_seconde_seance = v.pipe(v.optional(v.boolean()));

const amb_hos = v.nullable(v.nullable(v.picklist(SEX)));

// TODO : ADD the tarif(s) and suppléements

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	created_at,
	motif,
	plan_du_ttt,
	numero_etablissement,
	service,
	groupe_id,
	lieu_id,
	duree_id,
	patho_lourde_type,
	amb_hos,
	has_seconde_seance,
	supplements
};

export const SPSchema = v.pipe(
	v.object({
		...validateurs
	})
);

export async function onValid(data) {
	trace('In SPForm.onValid');

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

export const tarificationField = [];

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
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'service',
		name: 'service',
		inputType: 'text',
		placeholder: get(t)('sp.update', 'label.service'),
		titre: get(t)('sp.update', 'label.service'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	}
];
