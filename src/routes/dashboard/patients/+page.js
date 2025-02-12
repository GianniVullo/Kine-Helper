import { appState } from '../../../lib/managers/AppState.svelte';
import { listPatients } from '../../../lib/user-ops-handlers/patients';

/** @type {import('./$types').PageLoad} */
export async function load() {
	console.log(appState);
	let patients = await listPatients(appState.user);
	return { patients };
}
