import { appState } from '../../../../../../../../lib/managers/AppState.svelte';
import { gatherTarifsforpageLoad } from '../../../../../../../../lib/cloud/components/forms/tarification-fields/tarifHelpers.js';

export const load = async ({ params }) => {
	if (!appState.db) {
		await appState.init({});
	}
	return await gatherTarifsforpageLoad(params.spId);
};
