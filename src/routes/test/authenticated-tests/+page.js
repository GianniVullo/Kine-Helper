import { trace } from '@tauri-apps/plugin-log';
import { appState } from '../../../lib/managers/AppState.svelte';
import { supabase } from '../../../lib/stores/supabaseClient';

/** @type {import('./$types').PageLoad} */
export async function load() {
	if (!appState.db) {
		await appState.initializeDatabase('cloud');
		const user = await supabase.auth.getUser();
		console.log('User from load:', user);
		trace(JSON.stringify(user));
		await appState.init({
			user: user.data.user,
			session: (await supabase.auth.getSession()).data.session,
			profil: { offre: 'cloud' }
		});
	}
	appState.db.offre = 'cloud';
	return {};
}
