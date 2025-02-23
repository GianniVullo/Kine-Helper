import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createSituationPathologique } from '../../../../user-ops-handlers/situations_pathologiques';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { groupes, lieux } from '../../../../stores/codeDetails';

const SEX = ['AMB', 'HOS', null, undefined];

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
	v.nullish(v.string())
);
const service = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.string())
);

// Tarifaction fields
const supplements = v.nullish(v.array(v.uuid()), []);

const tarif_seance = v.nullish(v.uuid());
const tarif_indemnite_dplcmt = v.nullish(v.uuid());
const tarif_rapport_ecrit = v.nullish(v.uuid());
const tarif_consultatif = v.nullish(v.uuid());
const tarif_seconde_seance = v.nullish(v.uuid());
const tarif_intake = v.nullish(v.uuid());
// The nomenclature fields
// Ces champs peuvent être nul ici et dans la création de séance mais pas dans la génération d'attestation

const groupe_id = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.number())
);
const lieu_id = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.number())
);
const duree_id = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullish(v.number())
);
const patho_lourde_type = v.nullish(v.number());
const gmfcs = v.nullish(v.number());
const has_seconde_seance = v.optional(v.boolean(), false);

const amb_hos = v.nullish(v.picklist(SEX));

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
	gmfcs,
	amb_hos,
	has_seconde_seance,
	supplements,
	tarif_seance,
	tarif_indemnite_dplcmt,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake
};

export const SPSchema = v.pipe(
	v.object({
		...validateurs
	}),
	v.transform((input) => {
		input.metadata = {};
		if (input.tarif_seance) {
			input.metadata.tarif_seance = input.tarif_seance;
		}
		if (input.tarif_indemnite_dplcmt) {
			input.metadata.tarif_indemnite_dplcmt = input.tarif_indemnite_dplcmt;
		}
		if (input.tarif_rapport_ecrit) {
			input.metadata.tarif_rapport_ecrit = input.tarif_rapport_ecrit;
		}
		if (input.tarif_consultatif) {
			input.metadata.tarif_consultatif = input.tarif_consultatif;
		}
		if (input.tarif_seconde_seance) {
			input.metadata.tarif_seconde_seance = input.tarif_seconde_seance;
		}
		if (input.tarif_intake) {
			input.metadata.tarif_intake = input.tarif_intake;
		}

		if (Object.keys(input.metadata).length === 0) {
			input.metadata = null;
		}
		delete input.tarif_seance;
		delete input.tarif_indemnite_dplcmt;
		delete input.tarif_rapport_ecrit;
		delete input.tarif_consultatif;
		delete input.tarif_seconde_seance;
		delete input.tarif_intake;
		return input;
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
