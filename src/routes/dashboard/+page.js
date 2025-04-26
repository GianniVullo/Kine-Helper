import { appState } from '../../lib/managers/AppState.svelte';

/** @type {import('./$types').PageLoad} */
export async function load() {
	if (!appState.db) {
		await appState.init({});
	}
	// patients pour savoir si il y a au moins 1 patient dans la db Sinon on met le empty state
	let { data: patients, error: fetchPatientError } = await appState.db.select(
		`SELECT p.* FROM patients p WHERE p.user_id = $1`,
		[appState.user.id]
	);
	// si patients > 0 on peut par exemple fetch les séances facturables pour inciter le kiné à accéder à la page finance
	if (fetchPatientError) {
		console.error('fetchPatientError', fetchPatientError);
	}
	if (patients.length === 0) {
		return {
			noPatientYet: true
		};
	} else {
		// on peut fetch les séances facturables
		let { data: total, error } = await appState.db.select(
			'SELECT COUNT(*) as total FROM seances s WHERE s.user_id = $1 AND s.has_been_attested = 0',
			[appState.user.id]
		);
		if (total) {
			total = total[0].total;
		} else {
			total = 0;
		}
		if (error) {
			console.error('Error fetching total:', error);
			reject(error);
			return;
		}
		return { total };
	}
}
