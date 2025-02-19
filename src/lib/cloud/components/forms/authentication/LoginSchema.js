import * as v from 'valibot';
import { get } from 'svelte/store';
import { t } from '../../../../i18n';
import { retrieveProfile, signUserIn } from '../../../../user-ops-handlers/users';
import { goto } from '$app/navigation';
import { lock, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';
import { appState } from '../../../../managers/AppState.svelte';
import { trace, error as errorLog, info } from '@tauri-apps/plugin-log';

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
	trace('In the LoginForm onValid');
	await appState.initializeDatabase();
	// Connecter l'utilisateur
	let { user, session, error } = await signUserIn(data);

	if (error) {
		errorLog(`Erreur dans LoginForm onValid : ${error}`);
		switch (error.message) {
			case 'Invalid login credentials':
				return (this.message = 'Identifiants incorrects');
			default:
				return (this.message = error.message);
		}
	}
	info('Successfully logged user in');

	trace('Fetching local user data');
	let { data: kine, error: kineError } = await appState.db.select(
		'SELECT * FROM kines WHERE user_id = $1',
		[user.id]
	);

	if (kineError) {
		return (this.message = kineError);
	}
	trace('Local user data successfully fetched');

	user = { ...user, ...kine[0] };

	trace('Remote user data fetching');
	// Call au serveur pour obtenir les données de profil utilisateur nécessaire à la gestion des
	this.message = get(t)('login', 'submission.profil');
	let { data: profil, error: profilError } = await retrieveProfile(user.id);
	if (profilError) {
		return (this.message = profilError);
	}
	info('Remote user data successfully fetched');

	// Récupérer les settings
	this.message = get(t)('login', 'submission.settings', null, 'Gathering settings');

	trace('Initialising AppState for the first time');
	await appState.init({ user, session, profil });
	// Initialiser l'objet "AppState"

	// REDIRECTION :
	// Si l'utilisateur n'a pas de stronghold key
	if (!appState.user.has_stronghold_key) {
		info('User has no stronghold key');
		goto('/post-signup-forms/encryption-key-setup');
		return;
	}

	// REDIRECTION :
	// Si l'utilisateur a une stronghold key mais n'a pas de stronghold (ça voudrait dire que il essaye d'enregistrer un autre appareil)
	if (!appState.user.hold_exists) {
		info('User has stronghold key but no stronghold');
		goto('/post-signup-forms/encryption-key-setup?cloud=true');
		return;
	}

	// REDIRECTION :
	// Si le profil de l'utilisateur est incomplet
	if (!appState.has_complete_profile()) {
		info('User has incomplete profile');
		goto('/post-signup-forms/kine-profile');
		return;
	}

	// Check si l'utilisateur a au moins un appareil enregistré
	trace('Fetching user devices');
	// TODO Add Appareil
	// let { data: appareil, error: appareilError } = await appState.db.select(
	// 	'SELECT * FROM appareils;'
	// );

	// if (appareilError) {
	// 	console.log('appareil Error : ', appareilError);

	// 	return (this.message = appareilError);
	// }

	// REDIRECTION :
	// Si l'utilisateur n'a pas d'appareil enregistré
	// if (materiel?.length === 0) {
	// 	info('User has no device on local db');
	// 	goto('/post-signup-forms/printer-setup');
	// 	return;
	// }

	info('Everything is fine, redirecting to the dashboard');
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
