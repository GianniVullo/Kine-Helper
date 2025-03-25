import { UserOperationsHandler } from './abstractHandler';
import { user } from '../stores/UserStore';
import DBAdapter from './dbAdapter';
import { LocalDatabase } from '../stores/databaseInitializer';
import dayjs from 'dayjs';
import { appState } from '../managers/AppState.svelte';

export async function retrieveSettings(user_id) {
	console.log('in retrieveSettings with appState = ', appState);

	let { data, error } = await appState.db.select('SELECT * FROM settings WHERE user_id = $1', [
		user_id
	]);
	if (error) {
		console.log('ERROR ', error);
	}
	return { data, error };
}
