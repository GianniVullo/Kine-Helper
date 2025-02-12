import { user } from '../stores/UserStore';
import { appDataDir } from '@tauri-apps/api/path';
import { get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import { supabase } from './supabaseClient';


// Retrieve the main key from the store
//! ça servait méga à rien de faire ça en fait -___-
// export async function getMainKey() {
// 	// const { client } = await initStronghold(get(user).profil.stronghold_key);
// 	// const store = client.getStore();
// 	const data = await invoke('get_main_key', { userId: get(user).user.id });
// 	console.log(data);
	
// 	if (!data) {
// 		return null;
// 	}
// 	return data;
// }

export async function generateEncryptionKeys() {
	//* 1. on génère un mot de passe pour vérrouiller le stronghold
	let stronghold_key = await invoke('generate_encryption_key');
	console.log('stronghold_key', stronghold_key);

	//* 2. crée le stronghold
	const vaultPath = `${await appDataDir()}/${get(user).user.id}.hold`;
	const vaultPassword = password ?? get(user).profil.stronghold_key;

	//* 3. On envoie la clé du stronghold au server
	const resp = await supabase
		.from('kinesitherapeutes')
		.update({ stronghold_key })
		.eq('id', get(user).user.id);
	console.log('response from supabase', resp);
	//* 4. on génère la clé d'encryption proprement dite
	let encryptionKey = await invoke('generate_encryption_key');
	//* 5. On stocke la clé d'encryption dans le stronghold
	let store = client.getStore();
	await store.insert(
		`${get(user).user.id}mainKey`,
		await invoke('from_base64_to_bytes', { key: encryptionKey })
	);
	//* 6. On enregistre la clé du stronghold dans le store user
	user.update((u) => {
		u.profil.stronghold_key = stronghold_key;
		return u;
	});
	//* 7. On sauvegarde les modification du stronghold
	await stronghold.save();
	//* 8. On retourne la clé d'encryption pour que l'utilisateur puisse la sauvegarder à sa guise
	return encryptionKey;
}
