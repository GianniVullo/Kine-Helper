import { trace } from '@tauri-apps/plugin-log';
import { appState } from '../../../lib/managers/AppState.svelte';
import { listPatients } from '../../../lib/user-ops-handlers/patients';

/** @type {import('./$types').PageLoad} */
export async function load() {
	trace('Loading patients from local db');
	await appState.init({})
	let patients = await listPatients(appState.user);
	console.log(patients);

	trace('Patients loaded from local db');
	return { patients };
}
