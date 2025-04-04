import { uuid, pipe, string, boolean, transform, isoDate, integer, object, number } from 'valibot';
import { t } from '../../../../../i18n';
import { goto, invalidate } from '$app/navigation';
import { info, trace } from '@tauri-apps/plugin-log';
import { createAnnexe } from '../../../../../user-ops-handlers/documents';
import { drawer } from '../../../../libraries/overlays/drawerUtilities.svelte';

const id = uuid();
const user_id = uuid();
const patient_id = uuid();
const sp_id = uuid();
const date = pipe(
	transform((input) => (input?.length === 0 ? null : input)),
	string('Ce champ est obligatoire'),
	isoDate()
);
const metadata = object({
	doc: string()
});
const buildable = boolean();
const notification = boolean();
const situation = pipe(number("Veuillez choisir une situation pathologique"), integer("Veuillez choisir une situation pathologique"));

export const validateurs = {
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

export const AccordSchema = pipe(
	object({
		...validateurs
	}),
	transform((input) => {
		if (input?.metadata?.doc === 'B') {
			input.metadata.notification = input.notification;
		}
		delete input.notification;
		return input;
	})
);

export async function onValid(data) {
	trace('In AttestationSchema.onValid');

	if (this.mode === 'create') {
		trace('Engaging Attestation creation');
		// <!--* CREATE PROCEDURE -->
		await createAnnexe(data);
		info('Attestation Creation done Successfully');
	} else {
		trace('Engaging Attestation modification');
		// <!--* UPDATE PROCEDURE -->
		// TODO
		info('Attestation modified done Successfully');
	}

	drawer.drawer.meta.accords.push(data);
	drawer.close();
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
