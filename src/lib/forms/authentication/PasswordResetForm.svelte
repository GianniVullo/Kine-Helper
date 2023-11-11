<script>
	import { user } from '$lib/stores/UserStore';
	import EmailField from './EmailField.svelte';
	import { SubmitButton, FormWrapper } from '../index';

	let message = '';

	async function passwordReset({ formData, submitter }) {
		const { data, error } = await supabase.auth.resetPasswordForEmail(
			formData.email.toLowerCase(),
			{
				redirectTo: 'https://kine-helper.be/kine-helper-app/reset-password'
			}
		);
		console.log(data, error);
		if (error) {
			message = error.message;
			submitter.disabled = false;
			throw new Error(error);
		} else {
			message = `Un email va être envoyé à ${formData.email.toLowerCase()} pour réinitialiser votre mot de passe`;
			console.log(data);
			submitter.innerHTML = 'Demande envoyée';
			console.log(user);
			console.log($user);
		}
	}
</script>

<FormWrapper
	formSchema={{
		isValid: passwordReset
	}}>
	<EmailField />
	<SubmitButton>Envoyer</SubmitButton>
	<div class="text-center font-medium text-secondary-700">{message}</div>
</FormWrapper>
