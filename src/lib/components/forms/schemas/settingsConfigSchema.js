import { boolean, digits, length, object, pipe, regex, transform, union } from 'valibot';
import {
	kineInamiValidator,
	stringLengthMoreThan1,
	stringLengthMoreThan1ButCanBeNull
} from '../validators/baseValidators';
import { get } from 'svelte/store';
import { t } from '../../../i18n';

let cpVal = (x) => pipe(stringLengthMoreThan1(), digits(), x);

export const validateurs = {
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
	gsm: stringLengthMoreThan1ButCanBeNull(),
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
			console.log('newInput', newInput);
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

export const KineSchema = pipe(
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
