import { info } from '../cloud/libraries/logging';
import { appState } from '../managers/AppState.svelte';

export async function retrieveSettings(user_id) {
	info('in retrieveSettings with appState = ', appState);

	let { data, error } = await appState.db.select('SELECT * FROM settings WHERE user_id = $1', [
		user_id
	]);
	if (error) {
		info('ERROR ', error);
	}
	info('Retrieved settings:', data);
	return { data, error };
}
