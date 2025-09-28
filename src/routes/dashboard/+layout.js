import { appState } from '../../lib/managers/AppState.svelte';

/** @type {import('./$types').LayoutLoad} */
export async function load() {
	if (!appState.db) {
		await appState.init({});
	}
	return {};
}
