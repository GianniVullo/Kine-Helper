import { pipe, transform, string, regex, nullish } from 'valibot';

export const numericalString = pipe(
	transform((input) => (input?.length == 0 ? null : input)),
	nullish(
		pipe(
			string('Ce champs est obligatoire'),
			regex(
				/^\d+(,\d{2})?$/,
				'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.'
			)
		)
	)
);

export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function convertToFloat(string) {
	if (typeof string !== 'string') {
		throw new Error('Input must be a string');
	}

	const sanitizedString = string.replace(',', '.');
	const result = parseFloat(sanitizedString);

	if (isNaN(result)) {
		throw new Error('Invalid number format');
	}

	return result;
}
