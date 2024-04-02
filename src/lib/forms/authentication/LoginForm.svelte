<script>
	import PasswordField from './PasswordField.svelte';
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/UserStore';
	import { patients } from '../../stores/PatientStore';
	import EmailField from './EmailField.svelte';
	import { SubmitButton, FormWrapper } from '../index';
	import { DBInitializer } from '../../stores/databaseInitializer';
	import DBAdapter from '../actions/dbAdapter';
	import dayjs from 'dayjs';
	import { get } from 'svelte/store';
	import { t } from '../../i18n';

	export let message = '';

	// <!--* Login validation -->
	async function signIn({ formData, submitter }) {
		// <!--* STEP 1 : Connecter l'utilisateur -->
		const { data, error } = await supabase.auth.signInWithPassword({
			email: formData.email.toLowerCase(),
			password: formData.password
		});
		let db = new DBAdapter();
		// <!--? STEP 1a : Error handling -->
		if (error) {
			message = error.message;
			submitter.disabled = false;
			spinner.classList.remove('!block');
			return;
		}
		user.set({
			user: data.user,
			session: data.session
		});
		message = `${get(t)('shared', 'welcome')} ${data.user.email}!`;
		console.log('user = ', $user);
		submitter.innerHTML = get(t)('login', 'submission.profil');
		// <!--* STEP 2 : Initialiser la DB -->
		// <!--? Télécharger et mettre à jour les codes de nomenclature -->
		submitter.innerHTML = get(t)('login', 'submission.convention');
		let dbInit = new DBInitializer();
		await dbInit.initialization(submitter);
		// <!--* STEP 3 : Récupérer les données de supabase -->
		// <!--? pour l'instant c'est inutile car on ne garde que le nom et prénom sur le serveur -->
		let kineData = await supabase.from('kinesitherapeutes').select().eq('id', data.user.id);
		// <!--? Si les données n'existe pas on va pas plus loin, on envoie sur post-signup-form -->
		if (kineData.data.length === 0) {
			submitter.disabled = false;
			goto('/post-signup-forms/kine-profile');
			return;
		}
		// <!--* STEP 4 : Récupérer les données de la DB -->
		// <!--? Normalement, si il y a un profil sur le serveur, il devrait y en avoir un sur la db -->
		let kineData2 = await db.retrieve('kines', '*', ['user_id', data.user.id]);
		console.log('kineData2', kineData2);
		// <!--? Si les données n'existe pas on va pas plus loin, on envoie sur post-signup-form -->
		if (kineData2.data.length === 0) {
			submitter.disabled = false;
			goto('/post-signup-forms/kine-profile');
			return;
		}
		// <!--* STEP 5 : Fusionner les données de supabase et de la db -->
		kineData = {
			user_id: kineData.data[0].id,
			nom: kineData.data[0].nom,
			prenom: kineData.data[0].prenom,
			inami: kineData2.data[0].inami,
			bce: kineData2.data[0].bce,
			iban: kineData2.data[0].iban,
			adresse: kineData2.data[0].adresse,
			cp: kineData2.data[0].cp,
			localite: kineData2.data[0].localite,
			conventionne: kineData2.data[0].conventionne
		};
		user.update((u) => {
			u.profil = kineData;
			return u;
		});
		submitter.innerHTML = get(t)('login', 'submission.patient');
		// <!--* STEP 6 : Récupérer les patients -->
		await patients.fetchPatient(data.user);
		submitter.innerHTML = get(t)('login', 'submission.settings');
		// <!--* STEP 7 : Récupérer les settings -->
		let userSettings = await db.retrieve('settings', '*', ['user_id', $user.user.id]);
		console.log('userSettings', userSettings);
		if (userSettings.data.length === 0) {
			await db.save('settings', {
				user_id: $user.user.id,
				created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
			});
			userSettings.data[0] = { raw_printer: null };
		}
		userSettings = userSettings.data[0];
		userSettings.is_nine_pin = userSettings.is_nine_pin === null ? false : JSON.parse(userSettings.is_nine_pin);
		// <!--* STEP 8 : Sauvegarder les données dans le store -->
		user.update((u) => {
			u.settings = userSettings;
			return u;
		});
		// <!--* STEP 9 : Si il n'y a pas d'imprimante matricielle on redirige vers la page setup correspondante -->
		if (!userSettings.raw_printer) {
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
