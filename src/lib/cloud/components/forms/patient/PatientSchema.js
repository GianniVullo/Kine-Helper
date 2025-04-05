import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createPatient, updatePatient } from '../../../../user-ops-handlers/patients';
import { get } from 'svelte/store';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';

const SEX = ['F', 'M'];

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
		v.transform((input) => (typeof input == 'number' ? `${input}` : input)),
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
		v.transform((input) => (typeof input == 'number' ? `${input}` : input)),
		v.string(),
		v.length(3, "Veuillez entrer seulement l'identifiant à 3 chiffres de la mutualité"),
		v.digits('Ce champ ne peut contenir que des chiffres')
	)
);
//// const numero_etablissement = v.nullable(v.string());
//// const service = v.nullable(v.string());
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
	//// numero_etablissement,
	//// service,
	// Contact
	tel,
	gsm,
	email
};

export const PatientSchema = v.pipe(
	v.object({
		...validateurs
	}),
);

export async function onValid(data) {
	trace('In PatientForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Patient creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await createPatient(data);
		if (error) {
			return (this.message = error.message);
		}
		info('Patient Creation done Successfully');
	} else {
		trace('Engaging Patient modification');
		// <!--* UPDATE PROCEDURE -->
		const { error } = await updatePatient(data);
		if (error) {
			return (this.message = error.message);
		}
		await invalidate('patient:layout');
		info('Patient modified done Successfully');
	}

	goto('/dashboard/patients/' + data.patient_id);
}

const identificationFields = [
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
		id: 'nom',
		name: 'nom',
		inputType: 'text',
		placeholder: get(t)('shared', 'name'),
		titre: get(t)('shared', 'name'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'prenom',
		name: 'prenom',
		inputType: 'text',
		placeholder: get(t)('shared', 'surname'),
		titre: get(t)('shared', 'surname'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'niss',
		name: 'niss',
		inputType: 'text',
		placeholder: get(t)('form.patient', 'label.niss'),
		titre: get(t)('form.patient', 'label.niss'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'date_naissance',
		name: 'date_naissance',
		inputType: 'date',
		placeholder: get(t)('form.patient', 'label.birthDate'),
		titre: get(t)('form.patient', 'label.birthDate'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'sexe',
		name: 'sexe',
		label: 'Sexe',
		inputType: 'radio',
		titre: get(t)('form.patient', 'label.sex'),
		options: [
			{ id: 'm', value: 'M', name: 'male', label: get(t)('form.patient', 'sex.male') },
			{ id: 'f', value: 'F', name: 'female', label: get(t)('form.patient', 'sex.female') }
		],
		help: null,
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},
	{
		id: 'adresse',
		name: 'adresse',
		inputType: 'text',
		placeholder: get(t)('shared', 'address'),
		titre: get(t)('shared', 'address'),
		help: null,
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},
	{
		id: 'cp',
		name: 'cp',
		inputType: 'text',
		placeholder: get(t)('form.postSignup', 'label.postCode'),
		titre: get(t)('form.postSignup', 'label.postCode'),
		help: null,
		outerCSS: 'sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'localite',
		name: 'localite',
		inputType: 'text',
		placeholder: get(t)('form.postSignup', 'label.city'),
		titre: get(t)('form.postSignup', 'label.city'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	}
];

const assurabiliteFields = [
	{
		id: 'mutualite',
		name: 'mutualite',
		inputType: 'text',
		placeholder: '319',
		titre: 'Mutualité',
		help: 'Veuillez n\'entrez que des nombres de 3 chiffres. Par exemple "319" pour Solidaris Wallonie',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'num_affilie',
		name: 'num_affilie',
		inputType: 'text',
		placeholder: get(t)('form.patient', 'label.num_affilie'),
		titre: get(t)('form.patient', 'label.num_affilie'),
		help: 'Ce champ est <span class="italic ">extrêmement</span> facultatif.',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'tiers_payant',
		name: 'tiers_payant',
		inputType: 'checkbox',
		checkboxLabel: get(t)('form.patient', 'label.tiers_payant'),
		checkboxDescription:
			'Cochez cette case pour pratiquer le tiers payant avec ce patient. Vous devrez donc envoyer vos attestations à sa mutuelle.',
		help: null,

		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'ticket_moderateur',
		name: 'ticket_moderateur',
		inputType: 'checkbox',
		checkboxLabel: get(t)('form.patient', 'label.ticket_moderateur'),
		checkboxDescription:
			'Cochez cette case si vous faites payer le ticket modérateur à votre patient. Attention il y a une limite au nombre de patient pour lequel vous laissez tomber le ticket modérateur.',
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'bim',
		name: 'bim',
		inputType: 'checkbox',
		checkboxLabel: get(t)('form.patient', 'label.bim'),
		help: null,
		checkboxDescription:
			'Cochez cette case si votre patient est un Bénéficiaire à Intervention Majorée.',
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	}
];

const contactFields = [
	{
		id: 'tel',
		name: 'tel',
		inputType: 'text',
		placeholder: get(t)('form.patient', 'label.tel'),
		titre: get(t)('form.patient', 'label.tel'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'gsm',
		name: 'gsm',
		inputType: 'text',
		placeholder: get(t)('form.postSignup', 'label.cellPhone'),
		titre: get(t)('form.postSignup', 'label.cellPhone'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'email',
		name: 'email',
		inputType: 'text',
		placeholder: 'email',
		titre: 'Email',
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	}
];

export const fieldSchema = [
	{
		id: 0,
		titre: 'Identification',
		description: '',
		fields: identificationFields
	},
	{
		id: 1,
		titre: 'Assurabilité',
		description: '',
		fields: assurabiliteFields
	},
	{
		id: 2,
		titre: 'Données de contact',
		description: '',
		fields: contactFields
	}
];
