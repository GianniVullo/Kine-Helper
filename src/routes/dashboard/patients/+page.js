import { trace } from '@tauri-apps/plugin-log';
import { appState } from '../../../lib/managers/AppState.svelte';
import { listPatients } from '../../../lib/user-ops-handlers/patients';
import { error as errorSvelte } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load() {
	trace('Loading patients from local db');
	await appState.init({});
	console.log("The apstate in load of patients",appState);
	
	let { data: patients, error } = await listPatients(appState.user);
	if (error) {
		errorSvelte(500, { message: error });
	}
	console.log(patients);

	trace('Patients loaded from local db');
	return { patients };
}
