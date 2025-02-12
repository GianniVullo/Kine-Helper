import { UserOperationsHandler } from './abstractHandler';
import { user } from '../stores/UserStore';
import DBAdapter from './dbAdapter';
import { LocalDatabase } from '../stores/databaseInitializer';
import dayjs from 'dayjs';
import { appState } from '../managers/AppState.svelte';

function setupSettingsOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function retrieveSettings(user_id) {
	const opsHandler = setupSettingsOpsHandler();
	await opsHandler.execute(async () => {
		let settings = (
			await appState.db.select('SELECT * FROM settings WHERE user_id = $1', [user_id])
		)[0];
		return settings;
	});
}
