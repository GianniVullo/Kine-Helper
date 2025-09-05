import { appState } from '../managers/AppState.svelte';
import { terminal } from 'virtual:terminal';

export async function retrieveSettings(user_id) {
	terminal.log('in retrieveSettings with appState = ', appState);

	let { data, error } = await appState.db.select('SELECT * FROM settings WHERE user_id = $1', [
		user_id
	]);
	if (error) {
		terminal.error('ERROR ', error);
	}
	terminal.log('Retrieved settings:', data);
	return { data, error };
}
