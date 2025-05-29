import { supabase } from '../stores/supabaseClient';
import { invoke } from '@tauri-apps/api/core';
import { file_exists } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';

export async function createUser(data) {
	const { data: _, error } = await supabase.auth.signUp({
		email: data.email.toLowerCase(),
		password: data.password
	});
	if (error) {
		return { error };
	}
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

export async function createProfile(data) {
	data.conventionne = JSON.parse(data.conventionne);
	data.cp = parseInt(data.cp);
	/**
	 ** - Enregistrer dans la base de données locale
	 ** - Enregistrer dans Supabase
	 ** - Mettre les données dans le cache de l'application
	 */
	const { data: profileExists, error: queryError } = await appState.db.select(
		'SELECT * FROM kines WHERE user_id = $1;',
		[appState.user.id]
	);
	console.log('Profile exists', profileExists);
	if (profileExists?.length > 0) {
		const { data: dbResponse, error: profileUserError } = await appState.db.update(
			'kines',
			[['user_id', appState.user.id]],
			data
		);
		if (profileUserError) {
			return { error: profileUserError };
		}
		console.log('Profile user', dbResponse);
	} else {
		const { data: dbResponse, error: profileUserError } = await appState.db.insert('kines', data);
		if (profileUserError) {
			return { error: profileUserError };
		}
		console.log('Profile user', dbResponse);
	}
	if (
		(profileExists?.length > 0 &&
			(data.nom !== profileExists[0].nom || data.prenom != profileExists[0].prenom)) ||
		profileExists?.length === 0
	) {
		const { data: supabaseResponse, error: supaError } = await supabase
			.from('kinesitherapeutes')
			.upsert({
				id: appState.user.id,
				nom: data.nom,
				prenom: data.prenom,
				encrypted: null
			});
		console.log('Profile supabase', supabaseResponse);
		if (supaError) {
			return { error: supaError };
		}
	}

	await appState.init({
		user: { ...appState.user, ...data },
		session: appState.session,
		profil: data
	});

	return { data: appState.user };
}

export async function retrieveProfile(user_id) {
	let kineRemoteData;
	let errorThrown;
	try {
		const { data, error } = await supabase
			.from('kinesitherapeutes')
			.select('stronghold_key, offre')
			.eq('id', user_id);
		kineRemoteData = data?.[0] ?? {};
		errorThrown = error;
	} catch (error) {
		console.log("Erreur lors de l'appel à la table kines sur supabase");
		try {
			const { data, error } = await supabase.from('kines').select().eq('user_id', user_id);
			kineRemoteData = data?.[0] ?? {};
			errorThrown = error;
		} catch (error) {
			errorThrown = error;
		}
	}
	if (errorThrown || !kineRemoteData || Object.keys(kineRemoteData).length === 0) {
		return { data: kineRemoteData, error: errorThrown };
	}
	let has_stronghold_key;
	if (kineRemoteData.stronghold_key) {
		await invoke('setup_stronghold_key', {
			strongholdKey: kineRemoteData.stronghold_key
		});
		delete kineRemoteData.stronghold_key;
		has_stronghold_key = true;
	} else {
		has_stronghold_key = false;
	}
	// TODO : Le profil ne sera plus encrypté à partir de maintenant
	kineRemoteData.has_stronghold_key = has_stronghold_key;
	let hold_exists = await file_exists(`${user_id}.hold`);
	console.log('Hold exists', hold_exists);
	kineRemoteData.hold_exists = hold_exists;
	return { data: kineRemoteData, error: errorThrown };
}
