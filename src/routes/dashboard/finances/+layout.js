import { trace } from '@tauri-apps/plugin-log';
import { appState } from '../../../lib/managers/AppState.svelte';

/** @type {import('./$types').LayoutLoad} */
export async function load({ params, depends }) {
	depends('finance:layout');
	trace('Entering load function, getting appState from Rust');
	console.log("In the layout load function with ", appState);
	
	await appState.init({});
	return {};
}
