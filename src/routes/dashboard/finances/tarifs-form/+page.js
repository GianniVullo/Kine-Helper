import { error } from '@sveltejs/kit';
import { appState } from '../../../../lib/managers/AppState.svelte';
import { invalidate, invalidateAll } from '$app/navigation';

/** @type {import('./$types').PageLoad} */
export async function load() {
	console.log('In the tarifs-form load function with ', appState);
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
	let tarif_seance = tarifs.find((t) => JSON.parse(t.metadata)?.seance);
	let tarif_indemnite = tarifs.find((t) => JSON.parse(t.metadata)?.indemnite);
	let tarif_rapport_ecrit = tarifs.find((t) => JSON.parse(t.metadata)?.rapport_ecrit);
	let tarif_consultatif = tarifs.find((t) => JSON.parse(t.metadata)?.consultatif);
	let tarif_seconde_seance = tarifs.find((t) => JSON.parse(t.metadata)?.seconde_seance);
	let tarif_intake = tarifs.find((t) => JSON.parse(t.metadata)?.intake);
	let tarifs_custom = tarifs.filter((t) => JSON.parse(t.metadata)?.custom);
	let data = {
		tarif_seance,
		tarif_indemnite,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarifs: tarifs_custom,
		supplements
	};
	console.log('the data in tarifs-form', data);

	return data;
}
