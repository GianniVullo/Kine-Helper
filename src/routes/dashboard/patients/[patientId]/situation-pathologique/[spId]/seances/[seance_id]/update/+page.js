import { error as errorPage } from '@sveltejs/kit';
import { appState } from '../../../../../../../../../lib/managers/AppState.svelte';
import { gatherTarifsforpageLoad } from '../../../../../../../../../lib/components/forms/utils/tarifHelpers.js';
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

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [
		{
			patientId: 'test-patient',
			spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2',
			seance_id: '0b017e35-2b9a-4462-8723-fa2740af5ca2'
		}
	];
}
