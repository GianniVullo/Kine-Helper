import { appState } from '../../lib/managers/AppState.svelte';

/** @type {import('./$types').LayoutLoad} */
export async function load() {
    // au cas où l'app se reload et qu'on perd les données
    await appState.init({})
    return {};
}