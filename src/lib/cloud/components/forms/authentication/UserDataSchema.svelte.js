import { boolean, digits, length, union, object, pipe, regex, transform } from 'valibot';
import {
	inamiValidator,
	kineInamiValidator,
	stringLengthMoreThan1,
	stringLengthMoreThan1ButCanBeNull,
	stringVal
} from '../validators/commons';
import { get } from 'svelte/store';
import { t } from '../../../../i18n';
import { goto } from '$app/navigation';
import { createProfile } from '../../../../user-ops-handlers/users';
import { appState } from '../../../../managers/AppState.svelte';
import { Formulaire } from '../../../../cloud/libraries/formHandler.svelte';
import { isEmpty } from 'lodash';

function buildUserDataSchema() {
	let cpVal = (x) => pipe(stringLengthMoreThan1, digits(), x);
	const validateurs = {
		nom: stringLengthMoreThan1,
		prenom: stringLengthMoreThan1,
		adresse: stringLengthMoreThan1,
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
		localite: stringLengthMoreThan1,
		gsm: stringLengthMoreThan1ButCanBeNull,
		inami: kineInamiValidator,
		iban: pipe(
			stringLengthMoreThan1,
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
		bce: pipe(stringLengthMoreThan1, length(10, get(t)('form.postSignup', 'validation.bce'))),
		conventionne: boolean()
	};
	return {
		UserDataSchema: pipe(
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
		),
		validateurs
	};
}

async function onValid(formData) {
	console.log('Form data submitted:', formData, this.form);
	/**
	 * * On valide les données du formulaire et on crée le profil utilisateur.
	 ** Puis on le redirige vers la page de configuration de l'imprimante/scanner ou de tarifs/suppléments si nécessaire.
	 */
	if (!appState.db) {
		await appState.init({});
	}
	const filteredData = this.filtrerLesChampsAUpdater(formData);
	console.log('Filtered data for DB operation', filteredData);
	if (!isEmpty(filteredData)) {
		const { data, error } = await createProfile(filteredData);
		console.log('Db operation response', data);
		if (error) {
			this.message = error;
			return;
		}
	}

	// const { data: rawPrinter, error } = await appState.db.getRawPrinter();
	// if (!rawPrinter) {
	// 	goToStep(1);
	// } else {
	// 	if (
	// 		!formData.conventionne &&
	// 		// remplacer par un call supabase ou cache pour le cloud
	// 		!(await appState.db.select(
	// 			'SELECT * FROM tarifs WHERE json_extract(metadata, $.t_s) = $1'
	// 		),
	// 		[true])
	// 	) {
	// 		goToStep(2);
	// 	} else {
	// 		goto('/dashboard');
	// 	}
	// }
}
export function buildUserDataFormHandler({ delaySetup }) {
	const { UserDataSchema, validateurs } = buildUserDataSchema();

	return new Formulaire({
		schema: UserDataSchema,
		validateurs,
		initialValues: {
			...appState.user,
			conventionne: appState.user?.conventionne ?? false
		},
		onValid,
		submiter: '#user-data-button',
		formElement: '#user-data-form',
		delaySetup
	});
}

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
			},
			{
				id: 'gsm',
				name: 'gsm',
				inputType: 'text',
				placeholder: 'Téléphone',
				titre: 'Téléphone',
				help: null,
				outerCSS: 'col-span-full sm:col-span-4',
				innerCSS: ''
			}
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
