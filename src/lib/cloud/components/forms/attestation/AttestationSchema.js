import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createPatient, updatePatient } from '../../../../user-ops-handlers/patients';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';

const user_id = v.pipe(v.nonNullable(v.string()), v.uuid());
const patient_id = v.pipe(v.optional(v.string()), v.uuid());
const nom = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.string('Ce champ est obligatoire'),
	v.minWords(1, 'Veuillez insérer un nom')
);
const prenom = v.nullable(v.string());
const niss = v.pipe(
	v.transform((input) => (input?.length === 0 ? null : input)),
	v.nullable(
		v.pipe(
			v.string(),
			v.length(11, 'Veuillez insérer seulement les 11 caractères du niss'),
			v.digits('Ce champ ne peut contenir que des chiffres')
		)
	)
);
const date_naissance = v.pipe(
	v.nullable(v.isoDate())
	// v.transform((input) => dayjs(input))
);
const sexe = v.nullable(v.picklist(SEX));
const adresse = v.pipe(v.nullable(v.string()));
const cp = v.nullable(
	v.pipe(
		v.string(),
		v.length(4, 'Veuillez entrer seulement 4 chiffres svp'),
		v.digits('Ce champ ne peut contenir que des chiffres')
	)
);
const localite = v.nullable(v.string());
const num_affilie = v.nullable(v.string());
const tiers_payant = v.pipe(v.optional(v.boolean()));
const ticket_moderateur = v.pipe(v.optional(v.boolean()));
const bim = v.pipe(v.optional(v.boolean()));
const mutualite = v.nullable(
	v.pipe(
		v.string(),
		v.length(3, "Veuillez entrer seulement l'identifiant à 3 chiffres de la mutualité"),
		v.digits('Ce champ ne peut contenir que des chiffres')
	)
);
const numero_etablissement = v.nullable(v.string());
const service = v.nullable(v.string());
const email = v.pipe(
	v.transform((input) => (input?.length == 0 ? null : input)),
	v.nullable(v.pipe(v.string(), v.email('Email invalide')))
);
const tel = v.nullable(v.pipe(v.string(), v.digits('Ce champ ne peut contenir que des chiffres')));
const gsm = v.nullable(v.pipe(v.string(), v.digits('Ce champ ne peut contenir que des chiffres')));

export const validateurs = {
	// Id
	user_id,
	patient_id,
	nom,
	prenom,
	niss,
	date_naissance,
	sexe,
	adresse,
	cp,
	localite,
	// Assurabilité
	num_affilie,
	tiers_payant,
	ticket_moderateur,
	bim,
	mutualite,
	numero_etablissement,
	service,
	// Contact
	tel,
	gsm,
	email
};

export const PatientSchema = v.pipe(
	v.object({
		// Id
		user_id,
		patient_id,
		nom,
		prenom,
		niss,
		date_naissance,
		sexe,
		adresse,
		cp,
		localite,
		// Assurabilité
		num_affilie,
		tiers_payant,
		ticket_moderateur,
		bim,
		mutualite,
		numero_etablissement,
		service,
		// Contact
		tel,
		gsm,
		email
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

const financialFields = [
	{
		id: 'total_recu',
		name: 'total_recu',
		inputType: 'text',
		titre: get(t)('attestation.detail', 'total_recu'),
		help: null,
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'valeur_totale',
		name: 'valeur_totale',
		inputType: 'text',
		titre: get(t)('attestation.detail', 'valeur_totale'),
		help: null,
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'with_indemnity',
		name: 'with_indemnity',
		inputType: 'hidden'
	},
	{
		id: 'with_intake',
		name: 'with_intake',
		inputType: 'hidden'
	},
	{
		id: 'with_rapport',
		name: 'with_rapport',
		inputType: 'hidden'
	},
	{
		id: 'seances',
		name: 'seances',
		inputType: 'hidden'
	}
];

const identificaitionFields = [
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	},
	{
		id: 'patient_id',
		name: 'patient_id',
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
		id: 'sp_id',
		name: 'sp_id',
		inputType: 'hidden'
	},
	{
		id: 'porte_prescr',
		name: 'porte_prescr',
		inputType: 'hidden'
	}
];

const additionalFields = [
	{
		id: 'has_been_printed',
		name: 'has_been_printed',
		inputType: 'checkbox',
		titre: get(t)('attestation.create', 'printNow'),
		help: null,
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'date',
		name: 'date',
		inputType: 'date',
		titre: get(t)('attestation.form', 'label.date'),
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'numero_etablissement',
		name: 'numero_etablissement',
		inputType: 'text',
		titre: get(t)('sp.update', 'label.numero_etablissement'),
		help: null,
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'service',
		name: 'service',
		inputType: 'text',
		titre: get(t)('sp.update', 'label.service'),
		help: null,
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	}
];

export const fieldSchema = [...financialFields, ...identificaitionFields, ...additionalFields];
