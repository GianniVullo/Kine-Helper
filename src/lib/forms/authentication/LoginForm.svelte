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

	export let message = '';

	async function signIn({ formData, submitter }) {
		const { data, error } = await supabase.auth.signInWithPassword({
			email: formData.email.toLowerCase(),
			password: formData.password
		});
		if (error) {
			message = error.message;
			submitter.disabled = false;
			spinner.classList.remove('!block');
			throw new Error(error);
		} else {
			message = `Bienvenue ${data.user.email}!`;
			console.log(data);
			submitter.innerHTML = 'Récupération du profil kiné';
			let kineData = await supabase.from('kinesitherapeutes').select().eq('id', data.user.id);
			console.log(kineData);
			user.set({
				user: data.user,
				session: data.session,
				profil: kineData.data[0]
			});
			console.log(kineData.data);
			if (kineData.data.length == 0) {
				submitter.innerHTML = 'Se connecter';
				submitter.disabled = false;
				goto('/post-signup-forms/kine-profile');
			} else {
				console.log(user);
				// ADD HERE DATABASE INITIALIZATION
				submitter.innerHTML = 'Vérification des conventions';
				let dbInit = new DBInitializer();
				await dbInit.initialization(submitter);
				submitter.innerHTML = 'Récupération des patients';
				await patients.fetchPatient(data.user);
				submitter.innerHTML = 'Récupération des configurations hardware';
				let db = new DBAdapter();
				let userSettings = await db.retrieve('settings', '*', ['user_id', $user.user.id]);
				console.log('UserSettings', userSettings);
				user.update((u) => {
					u.settings = userSettings.data[0];
					return u;
				});
				// submitter.disabled = false;
				if (userSettings.data.length === 0) {
					await db.save('settings', {
						user_id: $user.user.id,
						created_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
					});
					user.update((u) => {
						u.settings = { raw_printer: null };
						return u;
					});
					goto('/post-signup-forms/printer-setup');
				} else if (!userSettings.data[0].raw_printer) {
					goto('/post-signup-forms/printer-setup');
				} else {
					goto('/dashboard');
				}
			}
		}
	}
</script>

<FormWrapper
	formSchema={{
		isValid: signIn
	}}>
	<EmailField value={$user.user?.email} />
	<PasswordField withoutValidation />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Se connecter</SubmitButton>
</FormWrapper>
