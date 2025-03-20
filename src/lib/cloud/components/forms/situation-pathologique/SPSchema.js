import * as v from 'valibot';
import { t } from '../../../../i18n';
import {
	createSituationPathologique,
	editSituationPathologique
} from '../../../../user-ops-handlers/situations_pathologiques';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace, error as errorLog } from '@tauri-apps/plugin-log';
import { numericalString } from '../../../../utils/validationGenerics';
import { modelingMetadata } from '../tarification-fields/tarifHelpers';

const SEX = ['AMB', 'HOS', null, undefined];

const user_id = v.uuid();
const patient_id = v.uuid();
const sp_id = v.uuid();
const created_at = v.isoDate();
const motif = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.minWords(1, 'Veuillez insérer un nom')
);
const plan_du_ttt = v.nullish(v.string());
const numero_etablissement = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.string())
);
const service = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.string())
);

// Tarifaction fields
const supplements = v.nullish(v.array(v.uuid()));

const tarif_seance = v.nullish(v.uuid());
const tarif_indemnite = v.nullish(v.uuid());
const tarif_rapport_ecrit = v.nullish(v.uuid());
const tarif_consultatif = v.nullish(v.uuid());
const tarif_seconde_seance = v.nullish(v.uuid());
const tarif_intake = v.nullish(v.uuid());
const tarif_no_show = v.nullish(v.uuid());
const tarif_seance_custom = numericalString;
const tarif_indemnite_custom = numericalString;
const tarif_rapport_ecrit_custom = numericalString;
const tarif_consultatif_custom = numericalString;
const tarif_seconde_seance_custom = numericalString;
const tarif_intake_custom = numericalString;
const tarif_no_show_custom = numericalString;
// The nomenclature fields
// Ces champs peuvent être nul ici et dans la création de séance mais pas dans la génération d'attestation

const groupe_id = v.number('Veuillez choisir un groupe pathologique');
const lieu_id = v.number('Veuillez choisir un lieu');
const duree = v.nullish(v.number());
const patho_lourde_type = v.nullish(v.number());
const gmfcs = v.nullish(v.number());
const amb_hos = v.nullish(v.picklist(SEX));

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
	duree,
	patho_lourde_type,
	gmfcs,
	amb_hos,
	supplements,
	tarif_seance,
	tarif_indemnite,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarif_seance_custom,
	tarif_indemnite_custom,
	tarif_rapport_ecrit_custom,
	tarif_consultatif_custom,
	tarif_seconde_seance_custom,
	tarif_intake_custom,
	tarif_no_show,
	tarif_no_show_custom
};

export const SPSchema = v.pipe(
	v.object({
		...validateurs
	}),
	v.forward(
		v.partialCheck(
			[['lieu_id'], ['amb_hos']],
			(input) => input.lieu_id !== 7 || input.amb_hos,
			'Veuillez précisez si la séance est ambulatoire (par example au cabinet) ou hospitalier (en hopital)'
		),
		['amb_hos']
	),
	v.forward(
		v.partialCheck(
			[['groupe_id'], ['patho_lourde_type']],
			(input) => input.groupe_id !== 1 || typeof input.patho_lourde_type === 'number',
			'Merci de spécifier un type de pathologie lourde.'
		),
		['patho_lourde_type']
	),
	v.forward(
		v.partialCheck(
			[['patho_lourde_type'], ['gmfcs']],
			(input) => input.patho_lourde_type !== 1 || input.gmfcs,
			'Veuillez remplir le gmfcs du patient.'
		),
		['gmfcs']
	),
	v.forward(
		v.partialCheck(
			[['patho_lourde_type'], ['duree']],
			(input) => typeof input.patho_lourde_type === 'number' || input.duree,
			'Veuillez remplir le gmfcs du patient.'
		),
		['duree']
	),
	v.transform((input) => {
		modelingMetadata(input);
		if (Object.keys(input.metadata).length === 0) {
			input.metadata = null;
		}
		return input;
	})
);

export async function onValid(data) {
	trace('In SPForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging SP creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await createSituationPathologique(data);
		if (error) {
			this.message = error;
			return;
		}
		info('SP Creation done Successfully');
	} else {
		trace('Engaging sp modification');
		// <!--* UPDATE PROCEDURE -->
		const { error } = await editSituationPathologique(data);
		if (error) {
			errorLog('Error while updating SP', error);
			this.message = error;
			return;
		}
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
