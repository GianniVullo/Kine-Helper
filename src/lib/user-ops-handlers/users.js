import { supabase } from '../stores/supabaseClient';
import { UserOperationsHandler } from './abstractHandler';
import { user } from '../stores/UserStore';
import { invoke } from '@tauri-apps/api/core';
import { get } from 'svelte/store';

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
	const { data, error } = await supabase.auth.signInWithPassword({
		email: formData.email.toLowerCase(),
		password: formData.password
	});
	// <!--? STEP 1a : Error handling -->
	if (error) {
		throw new Error(error);
	}
	console.log(data.user);
	
	user.set({
		user: data.user,
		session: data.session
	});

	await user.getProfil(data.user.id);
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
			}),
			key: await invoke('get_main_key', { userId: get(user).user.id })
		});
		let { data, error } = await supabase
			.from('kinesitherapeutes')
			.update({ ...profil, encrypted: encrypted_field })
			.eq('id', get(user).user.id);
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
