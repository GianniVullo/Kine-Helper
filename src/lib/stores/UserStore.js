import { persisted } from 'svelte-persisted-store';
import { supabase } from './supabaseClient';
import { invoke } from '@tauri-apps/api/core';
import dayjs from 'dayjs';
import { decryptTable } from './encryption';
import { get } from 'svelte/store';
import { appState } from '../managers/AppState.svelte';

export class User {
	constructor(parameters) {
		async function getSettings(user_id, localDB, db) {
			let userLocalSettings = await localDB.select('SELECT * FROM settings WHERE user_id = $1', [
				user_id
			]);
			console.log('userLocalSettings', userLocalSettings);
			let userRemoteSettings = await db.retrieve('settings', '*', ['user_id', user_id]);
			console.log('userRemoteSettings', userRemoteSettings);
			if (userLocalSettings.length === 0) {
				//enregistrement local car il y a un trigger dans postgres qui crée un setting entry pour chaque nouvel utilisateur
				await localDB.execute('INSERT INTO settings (user_id, created_at) VALUES ($1, $2);', [
					user_id,
					dayjs().format('YYYY-MM-DD HH:mm:ss')
				]);
				userLocalSettings.push({ raw_printer: null });
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
			update((u) => {
				u.settings = unifiedSettings;
				return u;
			});
		}

		async function getProfil(user_id) {
			console.log('Successfully entered getProfil with user_id', user_id);

			// we use supabase directly here because we need this info from supabase either the user is on free or cloud plan
			// On est obligé de faire ça avec supabase ici parce que DBAdapter ne peux pas fonctionner tant qu'il n'a pas au moins l'attribut 'offre'
			let kineRemoteData;
			try {
				kineRemoteData = await supabase.from('kinesitherapeutes').select('*').eq('id', user_id);
			} catch (error) {
				console.log("Erreur lors de l'appel à la table kines sur supabase");
				kineRemoteData = await supabase.from('kines').select().eq('user_id', user_id);
			}
			console.log('KINEREMOTE DATA', JSON.parse(JSON.stringify(kineRemoteData)));

			let has_stronghold_key;
			if (kineRemoteData.data[0].stronghold_key) {
				await invoke('setup_stronghold_key', {
					strongholdKey: kineRemoteData.data[0].stronghold_key
				});
				delete kineRemoteData.data[0].stronghold_key;
				has_stronghold_key = true;
			} else {
				has_stronghold_key = false;
			}
			if (kineRemoteData.data.length === 0) {
				return false;
			}
			//! Decryption
			let profil;
			try {
				profil = await decryptTable('kines', kineRemoteData.data[0]);
			} catch (error) {
				console.error(error);
				throw error;
			}
			console.log('profil décrypté', profil);
			profil.has_stronghold_key = has_stronghold_key;
			user.update((u) => {
				u.profil = profil;
				return u;
			});
			return true;
		}

		function has_complete_profile() {
			let profil = get(user).profil;
			return (
				profil.nom &&
				profil.prenom &&
				profil.adresse &&
				profil.cp &&
				profil.localite &&
				profil.inami &&
				profil.iban &&
				profil.bce &&
				profil.conventionne
			);
		}
	}
}
function createUserStore() {
	const { subscribe, update, set } = persisted(
		'user',
		{},
		{
			storage: 'session'
		}
	);

	//? En fait l'histoire: Une partie des settings doit être local car c'est relatif à la machine, par exemple les imprimantes et données s'y rapportant. Mais certains settings devraient être sur le cloud comme les préférences de langues, d'interfaces, de valeurs par défaut des formulaires etc...

	async function getSettings(user_id, localDB, db) {
		let userLocalSettings = await localDB.select('SELECT * FROM settings WHERE user_id = $1', [
			user_id
		]);
		console.log('userLocalSettings', userLocalSettings);
		let userRemoteSettings = await db.retrieve('settings', '*', ['user_id', user_id]);
		console.log('userRemoteSettings', userRemoteSettings);
		if (userLocalSettings.length === 0) {
			//enregistrement local car il y a un trigger dans postgres qui crée un setting entry pour chaque nouvel utilisateur
			await localDB.execute('INSERT INTO settings (user_id, created_at) VALUES ($1, $2);', [
				user_id,
				dayjs().format('YYYY-MM-DD HH:mm:ss')
			]);
			userLocalSettings.push({ raw_printer: null });
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
		update((u) => {
			u.settings = unifiedSettings;
			return u;
		});
	}

	async function getProfil(user_id) {
		console.log('Successfully entered getProfil with user_id', user_id);

		// we use supabase directly here because we need this info from supabase either the user is on free or cloud plan
		// On est obligé de faire ça avec supabase ici parce que DBAdapter ne peux pas fonctionner tant qu'il n'a pas au moins l'attribut 'offre'
		let kineRemoteData;
		try {
			kineRemoteData = await supabase.from('kinesitherapeutes').select('*').eq('id', user_id);
		} catch (error) {
			console.log("Erreur lors de l'appel à la table kines sur supabase");
			kineRemoteData = await supabase.from('kines').select().eq('user_id', user_id);
		}
		console.log('KINEREMOTE DATA', JSON.parse(JSON.stringify(kineRemoteData)));

		let has_stronghold_key;
		if (kineRemoteData.data[0].stronghold_key) {
			await invoke('setup_stronghold_key', {
				strongholdKey: kineRemoteData.data[0].stronghold_key
			});
			delete kineRemoteData.data[0].stronghold_key;
			has_stronghold_key = true;
		} else {
			has_stronghold_key = false;
		}
		if (kineRemoteData.data.length === 0) {
			return false;
		}
		//! Decryption
		let profil;
		try {
			profil = await decryptTable('kines', kineRemoteData.data[0]);
		} catch (error) {
			console.error(error);
			throw error;
		}
		console.log('profil décrypté', profil);
		profil.has_stronghold_key = has_stronghold_key;
		user.update((u) => {
			u.profil = profil;
			return u;
		});
		appState.setProfile(profil);
		return true;
	}

	function has_complete_profile() {
		let profil = get(user).profil;
		return (
			profil.nom &&
			profil.prenom &&
			profil.adresse &&
			profil.cp &&
			profil.localite &&
			profil.inami &&
			profil.iban &&
			profil.bce &&
			profil.conventionne
		);
	}
	return {
		subscribe,
		update,
		set,
		getSettings,
		getProfil,
		has_complete_profile
	};
}

export const user = createUserStore();
