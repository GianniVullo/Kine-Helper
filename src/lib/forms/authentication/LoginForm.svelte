<script>
	import PasswordField from './PasswordField.svelte';
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/UserStore';
	import { patients } from '../../stores/PatientStore';
	import EmailField from './EmailField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import FormWrapper from '../FormWrapper.svelte';

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
			let kineData = await supabase.from('kinesitherapeute').select().eq('id', data.user.id)
			user.set({
				user: data.user,
				session: data.session,
				profil: kineData.data[0]
			})
			console.log(kineData.data);
			if (kineData.data.length == 0) {
				submitter.innerHTML = 'Se connecter';
				submitter.disabled = false;
				goto('/post-signup-form')
			} else {
				submitter.innerHTML = 'Récupération des patients';
				await patients.fetchPatient(data.user);
				submitter.disabled = false;
				console.log(user);
				goto('/dashboard');
			}
		}
	}
</script>

<FormWrapper
	formSchema={{
		isValid: signIn
	}}>
	<EmailField value={$user.user?.email} />
	<PasswordField />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Se connecter</SubmitButton>
</FormWrapper>
