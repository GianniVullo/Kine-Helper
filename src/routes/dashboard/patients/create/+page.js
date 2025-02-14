import { appState } from '../../../../lib/managers/AppState.svelte';

/** @type {import('./$types').PageLoad} */
export async function load() {
	await appState.init({});
	return {};
}
