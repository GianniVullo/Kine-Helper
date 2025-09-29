import { object, number, pipe, minValue, maxValue } from 'valibot';

// Custom validators for printer spacing ranges
const spacingMmValidator = () =>
	pipe(
		number('Veuillez entrer un nombre valide'),
		minValue(0, 'La valeur doit être supérieure ou égale à 0'),
		maxValue(30, 'La valeur doit être inférieure ou égale à 30')
	);

const spacingScaleValidator = () =>
	pipe(
		number('Veuillez entrer un nombre valide'),
		minValue(40, 'La valeur doit être supérieure ou égale à 40'),
		maxValue(130, 'La valeur doit être inférieure ou égale à 130')
	);

const spacingSmallValidator = () =>
	pipe(
		number('Veuillez entrer un nombre valide'),
		minValue(0, 'La valeur doit être supérieure ou égale à 0'),
		maxValue(200, 'La valeur doit être inférieure ou égale à 200')
	);

const spacingMediumValidator = () =>
	pipe(
		number('Veuillez entrer un nombre valide'),
		minValue(0, 'La valeur doit être supérieure ou égale à 0'),
		maxValue(500, 'La valeur doit être inférieure ou égale à 500')
	);

const spacingLargeValidator = () =>
	pipe(
		number('Veuillez entrer un nombre valide'),
		minValue(0, 'La valeur doit être supérieure ou égale à 0'),
		maxValue(1000, 'La valeur doit être inférieure ou égale à 1000')
	);

export const validateurs = {
	// Global adjustments
	initial_spacing: spacingMmValidator(),
	spacing_scale: spacingScaleValidator(),

	// Identification section
	id_name_to_mutuality: spacingMediumValidator(),
	id_mutuality_to_niss: spacingMediumValidator(),
	id_niss_to_address: spacingMediumValidator(),
	id_address_to_postal: spacingMediumValidator(),
	id_postal_to_next: spacingMediumValidator(),

	// Prestations section
	prest_name_to_table: spacingLargeValidator(),
	prest_line_0: spacingSmallValidator(),
	prest_line_1: spacingSmallValidator(),
	prest_line_2: spacingSmallValidator(),
	prest_line_3: spacingSmallValidator(),
	prest_line_4: spacingSmallValidator(),
	prest_line_5: spacingSmallValidator(),
	prest_line_6: spacingSmallValidator(),
	prest_line_7: spacingSmallValidator(),
	prest_line_8: spacingSmallValidator(),
	prest_line_9: spacingSmallValidator(),

	// Prescription spacing
	presc_spacing_0: spacingSmallValidator(),
	presc_spacing_1: spacingSmallValidator(),
	presc_spacing_2: spacingSmallValidator(),
	presc_spacing_3: spacingSmallValidator(),
	presc_spacing_4: spacingSmallValidator(),
	presc_spacing_5: spacingSmallValidator(),
	presc_spacing_6: spacingSmallValidator(),
	presc_spacing_7: spacingSmallValidator(),
	presc_spacing_8: spacingSmallValidator(),

	// signature
	sign_total_to_name: spacingSmallValidator(),
	sign_internal: spacingSmallValidator(),
	sign_name_line_spacing: spacingSmallValidator(),
	sign_after_location: spacingSmallValidator(),

	// Remboursement
	remb_to_bce: spacingSmallValidator(),
	remb_bce_to_date: spacingSmallValidator(),
	remb_date_to_total: spacingSmallValidator()
};

export const FineTuningRawPrinterSchema = object(validateurs);
