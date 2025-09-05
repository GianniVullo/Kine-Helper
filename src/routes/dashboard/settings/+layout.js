import { appState } from '../../../lib/managers/AppState.svelte';
import { terminal } from "virtual:terminal";

/** @type {import('./$types').PageLoad} */
export async function load() {
	await appState.init({});
	return {};
}
