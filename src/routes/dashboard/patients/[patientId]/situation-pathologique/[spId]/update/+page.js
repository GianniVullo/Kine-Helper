import { error } from '@sveltejs/kit';
import { appState } from '../../../../../../../lib/managers/AppState.svelte.js';
import { getTarifs } from '../../../../../../../lib/components/forms/utils/tarifHelpers.js';

export const load = async () => {
	if (!appState.db) {
		await appState.init({});
	}
	return await getTarifs(error);
};

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient', spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2' }];
}
