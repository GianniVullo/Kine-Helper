import { appState } from '../../../lib/managers/AppState.svelte';

/** @type {import('./$types').PageLoad} */
export async function load() {
	await appState.init({});
	appState.set_eHealth({
		ssin: '',
		certificate: ``,
		saml_token: {
			not_on_or_after: '',
			raw_assertion_xml: ``
		}
	});
	// let appstate = await invoke('get_app_state');
	// console.log('AppState from rust:', appstate);
	return {};
}
