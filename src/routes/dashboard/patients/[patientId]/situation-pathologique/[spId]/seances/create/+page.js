import { appState } from '../../../../../../../../lib/managers/AppState.svelte';
import { gatherTarifsforpageLoad } from '../../../../../../../../lib/components/forms/utils/tarifHelpers.js';

export const load = async ({ params }) => {
	if (!appState.db) {
		await appState.init({});
	}
	return await gatherTarifsforpageLoad(params.spId);
};

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient', spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2' }];
}
