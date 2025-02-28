import { error } from '@sveltejs/kit';
import { appState } from '../../../../../../lib/managers/AppState.svelte.js';

export const load = async () => {
	if (!appState.db) {
		await appState.init({});
	}
	let { data: tarifs, error: dbError } = await appState.db.select(
		`SELECT * FROM tarifs WHERE user_id = $1`,
		[appState.user.id]
	);

	let { data: supplements, error: dbError2 } = await appState.db.select(
		`SELECT * FROM supplements WHERE user_id = $1`,
		[appState.user.id]
	);
	if (dbError || dbError2) {
		error(500, { message: dbError + dbError2 });
	}
	return { tarifs, supplements };
};

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient' }];
}
