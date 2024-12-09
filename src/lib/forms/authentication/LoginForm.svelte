<script>
	import PasswordField from './PasswordField.svelte';
	import { supabase } from '../../stores/supabaseClient';
	import { initializeConventions } from '../../stores/conventionStore';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/UserStore';
	import { patients } from '../../stores/PatientStore';
	import EmailField from './EmailField.svelte';
	import { SubmitButton, FormWrapper } from '../index';
	import { LocalDatabase } from '../../stores/databaseInitializer';
	import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
	import { get } from 'svelte/store';
	import { t } from '../../i18n';
	import { file_exists } from '../../utils/fsAccessor';
	import { tick } from 'svelte';
	import { retrieveSettings } from '../../user-ops-handlers/settings';
	import { listPatients } from '../../user-ops-handlers/patients';
	import { signUserIn } from '../../user-ops-handlers/users';

	export let message = '';

	// <!--* Login validation -->
	async function signIn({ formData, submitter }) {
		// <!--* STEP 1 : Connecter l'utilisateur -->
		await signUserIn(formData);
		message = `${get(t)('shared', 'welcome')} ${get(user).email}!`;
		console.log('user = ', $user);
		submitter.innerHTML = get(t)('login', 'submission.profil');
		// <!--* STEP 2 : Initialiser la DB -->
		// <!--? Télécharger et mettre à jour les codes de nomenclature -->
		submitter.innerHTML = get(t)('login', 'submission.convention');
		await initializeConventions(submitter);
		// <!--* STEP 4 : Récupérer les données de la DB -->
		// <!--* STEP 8 : Setup la sécurité -->
		// le cas de figure le plus fort c'est qu'il n'y a pas de stronghold key
		// cela signifie que rien n'est mis en place en ce qui concerne la sécurité
		// On redirige donc vers la page de mise en place de la sécurité
		submitter.innerHTML = get(t)('login', 'submission.security', null, 'Security check');
		await retrieveSettings({ user_id: $user.user.id });
		if (!$user.profil.has_stronghold_key) {
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
		let hold_exists = await file_exists(`${$user.user.id}.hold`);
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
		console.log('Now preparing to fetch patients with user = ', $user);

		await listPatients(get(user).user);
		submitter.innerHTML = get(t)('login', 'submission.settings', null, 'Gathering settings');
		// <!--* STEP 7 : Récupérer les settings -->
		await retrieveSettings({ user_id: $user.user.id });

		// <!--* STEP 9 : Si il n'y a pas d'imprimante matricielle on redirige vers la page setup correspondante -->
		if (!$user.settings.raw_printer) {
			goto('/post-signup-forms/printer-setup');
			return;
		}
		goto('/dashboard');
	}
</script>

<FormWrapper
	formSchema={{
		isValid: signIn
	}}>
	<EmailField value={$user.user?.email} />
	<PasswordField withoutValidation />
	<SubmitButton>{$t('login', 'controls.submit2')}</SubmitButton>
</FormWrapper>
