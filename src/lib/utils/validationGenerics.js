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
