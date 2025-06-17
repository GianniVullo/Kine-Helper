import { boolean, object } from 'valibot';
import { stringLengthMoreThan1ButCanBeNull } from '../validators/commons';
import { appState } from '../../../../managers/AppState.svelte';
import { Formulaire } from '../../../libraries/formHandler.svelte';

export function buildPrinterSchema() {
	const validateurs = {
		printer: stringLengthMoreThan1ButCanBeNull,
		is_nine_pin: boolean()
	};
	return { schema: object(validateurs), validateurs };
}

export function buildPrinterFormHandler({printer, delaySetup}) {
	const { schema, validateurs } = buildPrinterSchema();
	return new Formulaire({
		validateurs,
		schema,
		onValid,
		submiter: '#peripheric-button',
		formElement: '#peripheric-form',
		initialValues: { is_nine_pin: true, printer },
        delaySetup
	});
}

export async function onValid(formData) {
	if (!appState.db) {
		await appState.init({});
	}
	// it'es enough to store these in local db
	await appState.db.execute(
		'INSERT INTO appareils (id, name, role, metadata) VALUES ($1, $2, $3, $4)',
		[
			crypto.randomUUID(),
			formData.printer,
			'raw_printer',
			JSON.stringify({ is_nine_pin: formData.is_nine_pin })
		]
	);
}
