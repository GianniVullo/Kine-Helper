<script>
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/UserStore';
	import EmailField from './EmailField.svelte';
	import PasswordField from './PasswordField.svelte';
	import SubmitButton from '../SubmitButton.svelte';
	import FormWrapper from '../FormWrapper.svelte';

	let message = '';

	let formSchema = {
		isValid: signUp,
		validators: {
			password2: {
				fn: (value) => {
					return (
						document.getElementById('password').value == document.getElementById('password2').value
					);
				},
				errorMessage: 'Les mots de passe ne correspondent pas'
			}
		}
	};

	async function signUp({ formData, submitter }) {
		const { data, error } = await supabase.auth.signUp({
			email: formData.email.toLowerCase(),
			password: formData.password
		});
		if (error) {
			message = error.message;
			submitter.disabled = false;
		} else {
			message = `Bienvenue ${data.user.email}!`;
			console.log(data);
			user.set(data.user);
			submitter.disabled = false;
			console.log(user);
			console.log($user);
			goto('/post-signup-form');
		}
	}
</script>

<FormWrapper {formSchema}>
	<EmailField />
	<PasswordField />
	<PasswordField name="password2" />
	<div class="font-semibold">{message}</div>
	<SubmitButton>S'inscrire</SubmitButton>
</FormWrapper>
