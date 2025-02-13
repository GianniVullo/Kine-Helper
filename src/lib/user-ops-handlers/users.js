import { supabase } from '../stores/supabaseClient';
import { UserOperationsHandler } from './abstractHandler';
import { user } from '../stores/UserStore';
import { invoke } from '@tauri-apps/api/core';
import { get } from 'svelte/store';
import { file_exists } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';

function setupKineOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

//* Aïe aïe je ne sais vraiment pas encore décider si j'ai besoin de faire ça ? À priori oui car la mise-à-jour de ces données va éventuellement avoir besoin de suivre les autres outils
export async function createUser(data) {
	const opsHandler = setupKineOpsHandler();
	await opsHandler.execute(async () => {
		const { data, error } = await supabase.auth.signUp({
			email: data.email.toLowerCase(),
			password: data.password
		});
		if (error) {
			throw new Error(error);
		}
		user.set({
			user: data.user,
			session: data.session
		});
	});
}

export async function signUserIn(formData) {
	console.log('In the signUserIn');

	const { data, error } = await supabase.auth.signInWithPassword({
		email: formData.email.toLowerCase(),
		password: formData.password
	});
	//  TODO STEP 1a : Error handling
	if (error) {
		return { error };
	}

	return {
		user: data.user,
		session: data.session
	};
}

export async function retrieveProfile(user_id) {
	let kineRemoteData;
	try {
		kineRemoteData = await supabase
			.from('kinesitherapeutes')
			.select('stronghold_key, offre')
			.eq('id', user_id);
	} catch (error) {
		console.log("Erreur lors de l'appel à la table kines sur supabase");
		kineRemoteData = await supabase.from('kines').select().eq('user_id', user_id);
	}
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
		return;
	}
	// TODO : Le profil ne sera plus encrypté à partir de maintenant
	kineRemoteData.data[0].has_stronghold_key = has_stronghold_key;
	let hold_exists = await file_exists(`${user_id}.hold`);
	console.log('Hold exists', hold_exists);
	kineRemoteData.data[0].hold_exists = hold_exists;
	return kineRemoteData.data[0];
}

export async function updateUser(data) {
	const opsHandler = setupKineOpsHandler();
	await opsHandler.execute(async () => {
		const profil = {
			nom: data.nom,
			prenom: data.prenom
		};
		//! désormais les données de l'utilisateur seront sur le cloud. donc il faut directement utiliser supabase ici
		let encrypted_field = await invoke('encrypt_string', {
			input: JSON.stringify({
				inami: data.inami,
				bce: data.bce,
				iban: data.iban,
				adresse: data.adresse,
				cp: data.cp,
				localite: data.localite,
				conventionne: data.conventionne
			})
		});
		let { data, error } = await supabase
			.from('kinesitherapeutes')
			.update({ ...profil, encrypted: encrypted_field })
			.eq('id', appState.user.id);
		console.log(data, error);
		user.update((u) => {
			u.profil = {
				...u.profil,
				nom: data.nom,
				prenom: data.prenom,
				inami: data.inami,
				bce: data.bce,
				iban: data.iban,
				adresse: data.adresse,
				cp: data.cp,
				localite: data.localite,
				conventionne: data.conventionne
			};
			return u;
		});
		if (error) {
			message = error.message;
			throw new Error(error);
		}
	});
}
