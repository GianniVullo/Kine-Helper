import { UserOperationsHandler } from './abstractHandler';
import { user } from '../stores/UserStore';
import DBAdapter from './dbAdapter';
import { LocalDatabase } from '../stores/databaseInitializer';

function setupSettingsOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function retrieveSettings(data) {
	const opsHandler = setupSettingsOpsHandler();
	await opsHandler.execute(async () => {
		console.log('in the retrieveSettings with ', data);
		let localDB = new LocalDatabase();
		let db = new DBAdapter();

		let userLocalSettings = await localDB.select('SELECT * FROM settings WHERE user_id = $1', [
			data.user_id
		]);
		console.log('userLocalSettings', userLocalSettings);
		let userRemoteSettings = await db.retrieve('settings', '*', ['user_id', data.user_id]);
		console.log('userRemoteSettings', userRemoteSettings);
		if (userLocalSettings.length === 0) {
			//enregistrement local car il y a un trigger dans postgres qui crée un setting entry pour chaque nouvel utilisateur
			await localDB.execute('INSERT INTO settings (user_id, created_at) VALUES ($1, $2);', [
				data.user_id,
				dayjs().format('YYYY-MM-DD HH:mm:ss')
			]);
			userLocalSettings.push({ raw_printer: null });
		}
		if (!userRemoteSettings) {
			userRemoteSettings = { data: [] };
		}
		let unifiedSettings = {
			...userLocalSettings[0],
			...userRemoteSettings.data[0]
		};
		console.log('unified settings', unifiedSettings);

		unifiedSettings.is_nine_pin = unifiedSettings.is_nine_pin
			? false
			: JSON.parse(unifiedSettings.is_nine_pin);
		// <!--* STEP 8 : Sauvegarder les données dans le store -->
		user.update((u) => {
			u.settings = unifiedSettings;
			return u;
		});
	});
}
