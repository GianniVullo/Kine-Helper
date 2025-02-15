import { appState } from '$lib/managers/AppState.svelte';

/** @type {import('./$types').PageLoad} */
export async function load() {
	await appState.init({});
	return {};
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient' }];
}
