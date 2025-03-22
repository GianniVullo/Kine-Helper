import { error } from '@sveltejs/kit';
import { appState } from '../../../../lib/managers/AppState.svelte';
import { invalidate, invalidateAll } from '$app/navigation';

/** @type {import('./$types').PageLoad} */
export async function load() {
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
	let tarif_seance = tarifs.find((t) => JSON.parse(t.metadata)?.t_s);
	let tarif_indemnite = tarifs.find((t) => JSON.parse(t.metadata)?.t_id);
	let tarif_rapport_ecrit = tarifs.find((t) => JSON.parse(t.metadata)?.t_re);
	let tarif_consultatif = tarifs.find((t) => JSON.parse(t.metadata)?.t_c);
	let tarif_seconde_seance = tarifs.find((t) => JSON.parse(t.metadata)?.t_sec);
	let tarif_intake = tarifs.find((t) => JSON.parse(t.metadata)?.t_in);
	let tarif_no_show = tarifs.find((t) => JSON.parse(t.metadata)?.t_ns);
	let tarifs_custom = tarifs.filter((t) => JSON.parse(t.metadata)?.custom);
	let data = {
		tarif_seance,
		tarif_indemnite,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarif_no_show,
		tarifs: tarifs_custom,
		supplements
	};

	return data;
}
