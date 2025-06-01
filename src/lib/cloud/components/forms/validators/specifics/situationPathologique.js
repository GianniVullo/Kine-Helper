import { number, partialCheck } from 'valibot';

export const groupValidator = number('Veuillez choisir un groupe pathologique');

export const lieuValidator = number('Veuillez choisir un lieu');

export const ambHosValidator = partialCheck(
	[['lieu_id'], ['amb_hos']],
	(input) => input.lieu_id !== 7 || input.amb_hos,
	'Veuillez précisez si la séance est ambulatoire (par example au cabinet) ou hospitalier (en hopital)'
);

export const patho_lourde_typeValidator = partialCheck(
	[['groupe_id'], ['patho_lourde_type']],
	(input) => input.groupe_id !== 1 || typeof input.patho_lourde_type === 'number',
	'Merci de spécifier un type de pathologie lourde.'
);

export const imcValidator = partialCheck(
	[['patho_lourde_type'], ['gmfcs']],
	(input) => input.patho_lourde_type !== 1 || input.gmfcs,
	'Veuillez remplir le gmfcs du patient.'
);

// TODO: Explain this ?
export const imcPatientAgeValidator = partialCheck(
	[['patho_lourde_type'], ['duree']],
	(input) => typeof input.patho_lourde_type === 'number' || input.duree,
	'Veuillez remplir le gmfcs du patient.'
);
