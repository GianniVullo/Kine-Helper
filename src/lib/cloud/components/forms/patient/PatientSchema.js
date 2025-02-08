import * as v from 'valibot';
import { t } from '../../../../i18n';
import { createPatient, updatePatient } from '../../../../user-ops-handlers/patients';
import { get } from 'svelte/store';
import { appState } from '../../../../managers/AppState.svelte';
const SEX = ['F', 'M'];

export const PatientSchema = v.pipe(
	v.object({
		// Id
		user_id: v.pipe(
			v.nonNullable(v.string(), appState.user?.id),
			v.uuid()
		),
		patient_id: v.pipe(v.optional(v.string(), crypto.randomUUID()), v.uuid()),
		nom: v.pipe(
			v.transform((input) => (input?.length === 0 ? null : input)),
			v.string('Ce champ est obligatoire'),
			v.minWords(1, 'Veuillez insérer un nom')
		),
		prenom: v.nullable(v.string()),
		niss: v.pipe(
			v.transform((input) => (input?.length === 0 ? null : input)),
			v.nullable(
				v.pipe(
					v.string(),
					v.length(11, 'Veuillez insérer seulement les 11 caractères du niss'),
					v.digits('Ce champ ne peut contenir que des chiffres')
				)
			)
		),
		date_naissance: v.pipe(
			v.nullable(v.isoDate())
			// v.transform((input) => dayjs(input))
		),
		sexe: v.nullable(v.picklist(SEX)),
		adresse: v.pipe(v.nullable(v.string())),
		cp: v.nullable(
			v.pipe(
				v.string(),
				v.length(4, 'Veuillez entrer seulement 4 chiffres svp'),
				v.digits('Ce champ ne peut contenir que des chiffres')
			)
		),
		localite: v.nullable(v.string()),
		// Assurabilité
		num_affilie: v.nullable(v.string()),
		tiers_payant: v.pipe(v.optional(v.boolean(), false)),
		ticket_moderateur: v.pipe(v.optional(v.boolean(), true)),
		bim: v.pipe(v.optional(v.boolean(), false)),
		mutualite: v.nullable(
			v.pipe(
				v.string(),
				v.length(3, "Veuillez entrer seulement l'identifiant à 3 chiffres de la mutualité"),
				v.digits('Ce champ ne peut contenir que des chiffres')
			)
		),
		numero_etablissement: v.nullable(v.string()),
		service: v.nullable(v.string()),
		// Contact
		tel: v.nullable(v.pipe(v.string(), v.digits('Ce champ ne peut contenir que des chiffres'))),
		gsm: v.nullable(v.pipe(v.string(), v.digits('Ce champ ne peut contenir que des chiffres'))),
		email: v.pipe(
			v.transform((input) => (input?.length == 0 ? null : input)),
			v.nullable(v.pipe(v.string(), v.email('Email invalide')))
		)
	})
);

console.log('AFTER PatientSchema');

export async function onValid(data) {
	let patient;
	console.log(data);

	if (!patient) {
		// <!--* CREATE PROCEDURE -->
		await createPatient(data);
	} else {
		// <!--* UPDATE PROCEDURE -->
		await updatePatient(data);
	}
}
console.log('AFTER onValid');

const identificationFields = [
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

console.log('after idfields');

const assurabiliteFields = [
	{
		id: 'mutualite',
		name: 'mutualite',
		inputType: 'text',
		placeholder: '319',
		titre: get(t)('form.patient', 'mutualite'),
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
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'tiers_payant',
		name: 'tiers_payant',
		inputType: 'checkbox',
		titre: get(t)('form.patient', 'label.tiers_payant'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'ticket_moderateur',
		name: 'ticket_moderateur',
		inputType: 'checkbox',
		titre: get(t)('form.patient', 'label.ticket_moderateur'),
		help: null,
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'bim',
		name: 'bim',
		inputType: 'checkbox',
		titre: get(t)('form.patient', 'label.bim'),
		help: null,
		outerCSS: 'sm:col-span-4',
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
console.log('BEFORE fieldSchema');

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

console.log('END OF PatientSchema FILE');
