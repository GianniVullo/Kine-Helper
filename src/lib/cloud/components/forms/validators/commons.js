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
	uuid
} from 'valibot';

// Precursors
export const stringVal = string('Ce champ est obligatoire');
const minLengthVal = minLength(1, 'Ce champ ne peut pas être vide');
export const uuidVal = pipe(stringVal, uuid('Veuillez insérer un UUID valide'));
const lengthVal = length(11, 'Veuillez insérer 11 chiffres');
export const digitVal = digits("Veuillez n'insérer que des chiffres");
export const isoDateWithMessage = pipe(string(), isoDate('Veuillez insérer une date valide'));
export const isoTimeWithMessage = pipe(string(), isoTime('Veuillez insérer une heure valide'));
export const emailVal = email('Veuillez insérer un email valide');

// Validators
export const stringLengthMoreThan1ButCanBeNull = pipe(
	transform((input) => (input?.length === 0 ? null : input)),
	nullish(pipe(stringVal, minLengthVal))
);
export const stringLengthMoreThan1 = pipe(stringVal, minLengthVal);
export const inamiValidator = pipe(
	stringVal,
	lengthVal,
	digitVal,
	nonEmpty('Veuillez insérer le n°INAMI du prescripteur')
);

export const nissValidator = pipe(
	string(),
	length(11, 'Veuillez insérer seulement les 11 caractères du niss'),
	digitVal
);

export const postCodeValidator = pipe(
	transform((input) => (typeof input == 'number' ? `${input}` : input)),
	string(),
	length(4, 'Veuillez entrer seulement 4 chiffres svp'),
	digitVal
);

export const mutualiteValidator = pipe(
	transform((input) => (typeof input == 'number' ? `${input}` : input)),
	string(),
	length(3, "Veuillez entrer seulement l'identifiant à 3 chiffres de la mutualité"),
	digitVal
);

export const moneyValidator = pipe(
	string(),
	regex(
		/^\d+(,\d{2})?$/,
		'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
	)
);

export const integerValidator = pipe(
	number('Ce champ est obligatoire'),
	integer('Ce champ doit être un nombre')
);

export const accordSituationValidator = pipe(
	number('Veuillez choisir une situation pathologique'),
	integer('Veuillez choisir une situation pathologique')
);
