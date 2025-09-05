import {
	boolean,
	digits,
	length,
	union,
	object,
	pipe,
	regex,
	transform,
	string,
	uuid
} from 'valibot';
import { kineInamiValidator, stringLengthMoreThan1 } from '../validators/baseValidators';
import { get } from 'svelte/store';
import { t } from '../../../i18n';

let cpVal = (x) => pipe(stringLengthMoreThan1(), digits(), x);

export let validateurs = {
	user_id: pipe(string(), uuid()),
	nom: stringLengthMoreThan1(),
	prenom: stringLengthMoreThan1(),
	adresse: stringLengthMoreThan1(),
	cp: pipe(
		transform((input) => {
			if (typeof input === 'number') {
				return input.toString();
			}
			return input;
		}),
		union([cpVal(length(4)), cpVal(length(5))], get(t)('form.postSignup', 'validation.postCode')),
		transform((input) => parseInt(input))
	),
	localite: stringLengthMoreThan1(),
	// gsm: stringLengthMoreThan1ButCanBeNull,
	inami: kineInamiValidator(),
	iban: pipe(
		stringLengthMoreThan1(),
		transform((input) => {
			input = input.replaceAll(' ', '');
			input = input.toUpperCase();
			let newInput = '';

			for (let idx = 0; idx < input.length; idx++) {
				const element = input[idx];
				if ([4, 8, 12].includes(idx)) {
					newInput += ' ';
				}
				newInput += element;
			}
			return newInput;
		}),
		regex(
			/\b[A-Z]{2}[0-9]{2}(?:[ ]?[0-9]{4}){4}(?:[ ]?[0-9]{0,2})?$\b|\bBE[0-9]{2}(?:[ ]?[0-9]{4}){3}\b/,
			'Veuillez entrer un IBAN valide.'
		)
	),
	bce: pipe(stringLengthMoreThan1(), length(10, get(t)('form.postSignup', 'validation.bce'))),
	conventionne: boolean()
};

export const UserDataSchema = pipe(
	object(validateurs),
	transform((input) => {
		if (typeof input.cp === 'string') {
			input.cp = parseInt(input.cp, 10);
		}
		if (typeof input.conventionne === 'string') {
			input.conventionne = JSON.parse(input.conventionne);
		}
		return input;
	})
);

export const fieldsSchema = [
	{
		id: 0,
		titre: 'Données Personnelles',
		description: '',
		fields: [
			{
				id: 'nom',
				name: 'nom',
				inputType: 'text',
				placeholder: get(t)('shared', 'name'),
				titre: get(t)('shared', 'name'),
				help: null,
				outerCSS: 'col-span-full sm:col-span-3',
				innerCSS: ''
			},
			{
				id: 'prenom',
				name: 'prenom',
				inputType: 'text',
				placeholder: get(t)('shared', 'surname'),
				titre: get(t)('shared', 'surname'),
				help: null,
				outerCSS: 'col-span-full sm:col-span-3',
				innerCSS: ''
			}
			// {
			// 	id: 'gsm',
			// 	name: 'gsm',
			// 	inputType: 'text',
			// 	placeholder: 'Téléphone',
			// 	titre: 'Téléphone',
			// 	help: null,
			// 	outerCSS: 'col-span-full sm:col-span-4',
			// 	innerCSS: ''
			// }
		]
	},
	{
		id: 1,
		titre: 'Données professionnelles',
		description: '',
		fields: [
			{
				id: 'adresse',
				name: 'adresse',
				inputType: 'text',
				placeholder: get(t)('shared', 'address'),
				titre: get(t)('shared', 'address'),
				help: null,
				outerCSS: 'col-span-full sm:col-span-full',
				innerCSS: ''
			},
			{
				id: 'cp',
				name: 'cp',
				inputType: 'text',
				removeArrows: true,
				placeholder: get(t)('form.postSignup', 'label.postCode'),
				titre: get(t)('form.postSignup', 'label.postCode'),
				help: null,
				outerCSS: 'col-span-2',
				innerCSS: ''
			},
			{
				id: 'localite',
				name: 'localite',
				inputType: 'text',
				placeholder: get(t)('form.postSignup', 'label.city'),
				titre: get(t)('form.postSignup', 'label.city'),
				help: null,
				outerCSS: 'col-span-4',
				innerCSS: ''
			},
			{
				id: 'inami',
				name: 'inami',
				inputType: 'text',
				placeholder: 'INAMI',
				titre: 'INAMI',
				help: null,
				outerCSS: 'col-span-full sm:col-span-3',
				innerCSS: ''
			},
			{
				id: 'bce',
				name: 'bce',
				inputType: 'text',
				placeholder: get(t)('form.postSignup', 'label.bce'),
				titre: get(t)('form.postSignup', 'label.bce'),
				help: null,
				outerCSS: 'col-span-full sm:col-span-3',
				innerCSS: ''
			},
			{
				id: 'iban',
				name: 'iban',
				inputType: 'text',
				placeholder: 'IBAN : BEXX XXXX XXXX XXXX',
				titre: get(t)('login', 'label.iban'),
				help: null,
				outerCSS: 'col-span-full sm:col-span-3',
				innerCSS: ''
			},
			{
				id: 'conventionne',
				name: 'conventionne',
				inputType: 'checkbox',
				checkboxLabel: get(t)('form.postSignup', 'label.convention'),
				help: null,
				checkboxDescription: 'Cochez cette case si vous êtes conventionné.',
				outerCSS: 'col-span-full sm:col-span-4',
				innerCSS: ''
			}
		]
	}
];
