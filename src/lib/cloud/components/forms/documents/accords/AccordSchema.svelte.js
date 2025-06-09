import { uuid, pipe, string, boolean, transform, isoDate, object } from 'valibot';
import { t } from '../../../../../i18n';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { createAnnexe } from '../../../../../user-ops-handlers/documents';
import { accordSituationValidator, stringVal, uuidVal } from '../../validators/commons';

export function buildAccordSchema() {
	const id = uuidVal;
	const user_id = uuidVal;
	const patient_id = uuidVal;
	const sp_id = uuidVal;
	const date = pipe(
		transform((input) => (input?.length === 0 ? null : input)),
		stringVal,
		isoDate()
	);
	const metadata = object({
		doc: string()
	});
	const buildable = boolean();
	const notification = boolean();
	const situation = accordSituationValidator;

	const validateurs = {
		id,
		user_id,
		patient_id,
		sp_id,
		date,
		metadata,
		situation,
		buildable,
		notification
	};

	const AccordSchema = pipe(
		object({
			...validateurs
		}),
		transform((input) => {
			console.log('input', input);

			if (input?.metadata?.doc === 'B') {
				input.metadata.notification = input.notification;
			}
			delete input.notification;
			return input;
		})
	);
	return { AccordSchema, validateurs };
}

export async function onValid(data, mode) {
	trace('In AccordSchema.onValid');
	// <!--* CREATE PROCEDURE -->
	await createAnnexe(data);
	info('Accord Creation done Successfully');
	history.back();
}

export const fieldSchema = [
	{
		id: 'id',
		name: 'id',
		inputType: 'hidden'
	},
	{
		id: 'patient_id',
		name: 'patient_id',
		inputType: 'hidden'
	},
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	},
	{
		id: 'sp_id',
		name: 'sp_id',
		inputType: 'hidden'
	},
	{
		id: 'date',
		name: 'date',
		placeholder: "Date de l'attestation",
		inputType: 'date',
		titre: 'Date de l attestation',
		help: null,
		outerCSS: 'col-span-full',
		innerCSS: ''
	}
];
