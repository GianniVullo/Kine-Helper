import { error as errorPage } from '@sveltejs/kit';
import { appState } from '../../../../../../../../../lib/managers/AppState.svelte';
import { gatherTarifsforpageLoad } from '../../../../../../../../../lib/cloud/components/forms/tarification-fields/tarifHelpers.js';
import { Seance } from '../../../../../../../../../lib/user-ops-handlers/models.js';

export async function load({ params }) {
	if (!appState.db) {
		await appState.init({});
	}
	let { data, error } = await appState.db.select('SELECT * FROM seances WHERE seance_id = $1;', [
		params.seance_id
	]);

	if (error) {
		errorPage(500, { message: error });
	}
	const gatheredTarif = await gatherTarifsforpageLoad(params.spId);
	let seanceRaw = data?.[0];
	const seance = new Seance(seanceRaw);
	return { seance, ...gatheredTarif };
}
