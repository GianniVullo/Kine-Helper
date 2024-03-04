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
			message = `${get(t)('shared', 'welcome')} ${data.user.email}!`;
			submitter.innerHTML = get(t)('login', 'submission.profil');
			let kineData = await supabase.from('kinesitherapeutes').select().eq('id', data.user.id);
			user.set({
				user: data.user,
				session: data.session,
				profil: kineData.data[0]
			});
			if (kineData.data.length == 0) {
				submitter.disabled = false;
				goto('/post-signup-forms/kine-profile');
			} else {
				// ADD HERE DATABASE INITIALIZATION
				submitter.innerHTML = get(t)('login', 'submission.convention');
				let dbInit = new DBInitializer();
				await dbInit.initialization(submitter);
				submitter.innerHTML = get(t)('login', 'submission.patient');
				await patients.fetchPatient(data.user);
				submitter.innerHTML = get(t)('login', 'submission.settings');
				let db = new DBAdapter();
				let userSettings = await db.retrieve('settings', '*', ['user_id', $user.user.id]);
				user.update((u) => {
					u.settings = userSettings.data[0];
					return u;
				});
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
	<SubmitButton>{$t('login', 'controls.submit2')}</SubmitButton>
</FormWrapper>
