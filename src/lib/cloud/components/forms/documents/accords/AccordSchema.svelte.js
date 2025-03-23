import { uuid, pipe, string, boolean, transform, isoDate, integer, object } from 'valibot';
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
const situation = integer();

export const validateurs = {
	id,
	user_id,
	patient_id,
	sp_id,
	date,
	metadata,
	situation,
	buildable
};

export const AccordSchema = pipe(
	object({
		...validateurs
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
