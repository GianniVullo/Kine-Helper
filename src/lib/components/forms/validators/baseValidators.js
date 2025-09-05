import {
	isoDate,
	string,
	pipe,
	length,
	transform,
	minLength,
	digits,
	nonEmpty,
	nullish,
	email,
	regex,
	number,
	integer,
	isoTime,
	uuid,
	partialCheck,
	partialCheckAsync
} from 'valibot';
import { trace, error as errorLog } from '@tauri-apps/plugin-log';
import { appState } from '$lib/managers/AppState.svelte';

// Precursors
export const stringVal = () => string('Ce champ est obligatoire');
const minLengthVal = () => minLength(1, 'Ce champ ne peut pas être vide');
export const uuidVal = () => pipe(stringVal(), uuid('Veuillez insérer un UUID valide'));
const lengthVal = () => length(11, 'Veuillez insérer 11 chiffres');
export const digitVal = () => digits("Veuillez n'insérer que des chiffres");
export const isoDateEl = () => isoDate('Veuillez insérer une date valide');
export const isoDateWithMessage = () => pipe(string(), isoDateEl());
export const isoTimeWithMessage = () =>
	pipe(string(), isoTime('Veuillez insérer une heure valide'));
export const emailVal = () => email('Veuillez insérer un email valide');

// Validators
export const stringLengthMoreThan1ButCanBeNull = () =>
	pipe(
		transform((input) => (input?.length === 0 ? null : input)),
		nullish(pipe(stringVal(), minLengthVal()))
	);
export const stringLengthMoreThan1 = () => pipe(stringVal(), minLengthVal());
export const inamiValidator = () =>
	pipe(
		stringVal(),
		lengthVal(),
		digitVal(),
		nonEmpty('Veuillez insérer le n°INAMI du prescripteur')
	);
export const kineInamiValidator = () => pipe(stringLengthMoreThan1(), lengthVal(), digitVal());

export const nissValidator = () =>
	pipe(string(), length(11, 'Veuillez insérer seulement les 11 caractères du niss'), digitVal());

export const postCodeValidator = () =>
	pipe(
		transform((input) => (typeof input == 'number' ? `${input}` : input)),
		string(),
		length(4, 'Veuillez entrer seulement 4 chiffres svp'),
		digitVal()
	);

export const mutualiteValidator = () =>
	pipe(
		transform((input) => (typeof input == 'number' ? `${input}` : input)),
		string(),
		length(3, "Veuillez entrer seulement l'identifiant à 3 chiffres de la mutualité"),
		digitVal()
	);

export const moneyValidator = () =>
	pipe(
		string(),
		regex(
			/^\d+(,\d{2})?$/,
			'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
		)
	);

export const integerValidator = () =>
	pipe(number('Ce champ est obligatoire'), integer('Ce champ doit être un nombre'));

export const accordSituationValidator = () =>
	pipe(
		number('Veuillez choisir une situation pathologique'),
		integer('Veuillez choisir une situation pathologique')
	);

export const passwordValidator = () =>
	regex(
		/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
		'Your password must have 8 characters or more. Contains at least 1 upper case letter, one number and one special caracter'
	);

export const minLengthPassword = () => minLength(1, 'Please enter your password.');

export const partialCheckPasswordComparison = () =>
	partialCheck(
		[['password1'], ['password2']],
		(input) => input.password === input.password2,
		'The two passwords do not match.'
	);

export const seanceTypes = ['kiné', 'consult', 'seconde', 'no-show'];

export const seanceSameDayValidator = () =>
	partialCheckAsync(
		[['date']],
		async (input) => {
			trace('Checking for seances on the same day');
			let { data, error } = await appState.db.select(
				'SELECT * FROM seances WHERE date(date) = $1 AND sp_id = $2',
				[input.date, input.sp_id]
			);
			if (error) {
				errorLog('Error while checking for seances on the same day ' + error);
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
	);

export const multipleSeanceMinLengthValidator = () =>
	minLength(1, 'Veuillez ajouter au moins une séance');

export const groupValidator = () => number('Veuillez choisir un groupe pathologique');

export const lieuValidator = () => number('Veuillez choisir un lieu');

export const ambHosValidator = () =>
	partialCheck(
		[['lieu_id'], ['amb_hos']],
		(input) => input.lieu_id !== 7 || input.amb_hos,
		'Veuillez précisez si la séance est ambulatoire (par example au cabinet) ou hospitalier (en hopital)'
	);

export const patho_lourde_typeValidator = () =>
	partialCheck(
		[['groupe_id'], ['patho_lourde_type']],
		(input) => input.groupe_id !== 1 || typeof input.patho_lourde_type === 'number',
		'Merci de spécifier un type de pathologie lourde.'
	);

export const imcValidator = () =>
	partialCheck(
		[['patho_lourde_type'], ['gmfcs']],
		(input) => input.patho_lourde_type !== 1 || input.gmfcs,
		'Veuillez remplir le gmfcs du patient.'
	);

// TODO: Explain this ?
export const imcPatientAgeValidator = () =>
	partialCheck(
		[['patho_lourde_type'], ['duree']],
		(input) => typeof input.patho_lourde_type === 'number' || input.duree,
		'Veuillez remplir le gmfcs du patient.'
	);

export const numericalStringPrimitive = () =>
	pipe(
		string('Ce champs est obligatoire'),
		regex(
			/^\d+(,\d{2})?$/,
			'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
		)
	);
export const numericalString = () =>
	pipe(
		transform((input) => (input?.length == 0 ? null : input)),
		nullish(numericalStringPrimitive())
	);

	