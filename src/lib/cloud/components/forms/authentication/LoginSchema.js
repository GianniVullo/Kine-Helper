import * as v from 'valibot';
import { t } from '../../../../i18n';
import { get } from 'svelte/store';
// import { appState } from '../../../AppState.svelte';
import { signUserIn } from '../../../../user-ops-handlers/users';
import { initializeConventions } from '../../../../stores/conventionStore';
import { retrieveSettings } from '../../../../user-ops-handlers/settings';
import { file_exists } from '../../../../utils/fsAccessor';
import { goto } from '$app/navigation';
import { user } from '$lib/stores/UserStore';
import { listPatients } from '../../../../user-ops-handlers/patients';
import { lock, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';

export const LoginSchema = v.pipe(
	v.object({
		// Id
		email: v.pipe(
			v.transform((input) =>
				input?.length === 0 ? null : typeof input === 'string' ? input.toLowerCase() : input
			),
			v.pipe(v.string('Ce champ est obligatoire'), v.email('Email invalide'))
		),
		password: v.pipe(
			v.transform((input) => (input?.length == 0 ? null : input)),
			v.pipe(v.string('Ce champ est obligatoire'))
		)
	})
);

export async function onValid(data) {
	// <!--* STEP 1 : Connecter l'utilisateur -->
	await signUserIn(data);
	let submitter = document.querySelector(this.submiter);
	submitter.innerHTML = get(t)('login', 'submission.profil');

	// <!--* STEP 2 : Initialiser la DB -->
	// <!--? Télécharger et mettre à jour les codes de nomenclature -->
	submitter.innerHTML = get(t)('login', 'submission.convention');
	await initializeConventions(submitter);

	// <!--* STEP 8 : Setup la sécurité -->
	// le cas de figure le plus fort c'est qu'il n'y a pas de stronghold key
	// cela signifie que rien n'est mis en place en ce qui concerne la sécurité
	// On redirige donc vers la page de mise en place de la sécurité
	submitter.innerHTML = get(t)('login', 'submission.security', null, 'Security check');
	await retrieveSettings({ user_id: get(user).user.id });
	if (!get(user).profil.has_stronghold_key) {
		goto('/post-signup-forms/encryption-key-setup');
		return;
	}
	// si il y a une stronghold key il faut vérifier qu'il y a un stronghold
	// avec une clé d'encryption enregestrée dessus
	// par chance, la fonction getMainKey() contient la fonction initStronghold()
	// qui elle s'assure d'elle-même de la présence d'un fichier salt.txt sur applocaldatadir(),
	// ouvre ou crée un stronghold et
	// tente d'aller y puiser la clé de cryptage.
	// Si getMainKey retourne null, alors on envoie sur la page de setup avec un query parameter pour proposer en premier le formulaire plutôt que générer une clé d'encryption
	/**
	 * TODO Wrap this in userOpsHandler
	 * */
	let hold_exists = await file_exists(`${get(user).user.id}.hold`);
	console.log('file exists', hold_exists);

	if (!hold_exists) {
		goto('/post-signup-forms/encryption-key-setup?cloud=true');
		return;
	}

	// <!--* STEP 5 : Fusionner les données de supabase et de la db -->
	if (!user.has_complete_profile()) {
		submitter.disabled = false;
		goto('/post-signup-forms/kine-profile');
		return;
	}
	submitter.innerHTML = get(t)('login', 'submission.patient');
	// <!--* STEP 6 : Récupérer les patients -->
	console.log('Now preparing to fetch patients with user = ', get(user));

	await listPatients(get(user).user);
	submitter.innerHTML = get(t)('login', 'submission.settings', null, 'Gathering settings');
	// <!--* STEP 7 : Récupérer les settings -->
	await retrieveSettings({ user_id: get(user).user.id });

	// <!--* STEP 9 : Si il n'y a pas d'imprimante matricielle on redirige vers la page setup correspondante -->
	if (!get(user).settings.raw_printer) {
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
