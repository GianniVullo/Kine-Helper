import * as v from 'valibot';
import { get } from 'svelte/store';
import { t } from '../../../../i18n';
import { retrieveProfile, signUserIn } from '../../../../user-ops-handlers/users';
import { goto } from '$app/navigation';
import { lock, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';
import { appState } from '../../../../managers/AppState.svelte';
import { retrieveSettings } from '../../../../user-ops-handlers/settings';
import { AuthApiError } from '@supabase/supabase-js';

const email = v.pipe(
	v.transform((input) =>
		input?.length === 0 ? null : typeof input === 'string' ? input.toLowerCase() : input
	),
	v.pipe(v.string('Ce champ est obligatoire'), v.email('Email invalide'))
);

const password = v.pipe(
	v.transform((input) => (input?.length == 0 ? null : input)),
	v.pipe(v.string('Ce champ est obligatoire'))
);

export const validateurs = {
	email,
	password
};

export const LoginSchema = v.pipe(
	v.object({
		email,
		password
	})
);

export async function onValid(data) {
	await appState.initializeDatabase();
	// Connecter l'utilisateur
	let { user, session, error } = await signUserIn(data);
	console.log(user);

	let kine = (await appState.db.select('SELECT * FROM kines WHERE user_id = $1', [user.id]))[0];
	console.log('KINE = , ', kine);

	user = { ...user, ...kine };
	if (error) {
		console.log('the error = ', error.message, typeof error);

		switch (error.message) {
			case 'Invalid login credentials':
				return (this.message = 'Identifiants incorrects');
			default:
				return (this.message = error.message);
		}
	}
	appState.user = user;
	appState.session = session;

	// Call au serveur pour obtenir les données de profil utilisateur nécessaire à la gestion des
	this.message = get(t)('login', 'submission.profil');
	let profil = await retrieveProfile(user.id);
	console.log(profil);

	// Récupérer les settings
	this.message = get(t)('login', 'submission.settings', null, 'Gathering settings');
	let settings = await retrieveSettings(user.id);

	// Initialiser l'objet "AppState"
	appState.init(settings, profil);

	// REDIRECTION :
	// Si l'utilisateur n'a pas de stronghold key
	if (!appState.user.has_stronghold_key) {
		goto('/post-signup-forms/encryption-key-setup');
		return;
	}

	// REDIRECTION :
	// Si l'utilisateur a une stronghold key mais n'a pas de stronghold (ça voudrait dire que il essaye d'enregistrer un autre appareil)
	if (!appState.user.hold_exists) {
		goto('/post-signup-forms/encryption-key-setup?cloud=true');
		return;
	}

	// REDIRECTION :
	// Si le profil de l'utilisateur est incomplet
	if (!appState.has_complete_profile()) {
		goto('/post-signup-forms/kine-profile');
		return;
	}

	// Check si l'utilisateur a au moins un appareil enregistré
	let materiel = await appState.db.select('SELECT * FROM appareils;');
	// REDIRECTION :
	// Si l'utilisateur n'a pas d'appareil enregistré
	if (materiel?.length === 0) {
		goto('/post-signup-forms/printer-setup');
		return;
	}

	goto('/dashboard');
}

export const fieldSchema = [
	{
		id: 'email',
		name: 'email',
		inputType: 'text',
		leading: userIcon,
		leadingCSS: 'size-6 stroke-purple-500 stroke-2',
		placeholder: 'email',
		titre: 'Email',
		help: null,
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},
	{
		id: 'password',
		name: 'password',
		leading: lock,
		leadingCSS: 'size-6 stroke-purple-500 stroke-2',
		inputType: 'password',
		titre: 'Password',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	}
];
