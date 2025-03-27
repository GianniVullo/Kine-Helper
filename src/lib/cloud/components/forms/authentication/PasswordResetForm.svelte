<script>
	import { user } from '$lib/stores/UserStore';
	import EmailField from './EmailField.svelte';
	import { SubmitButton, FormWrapper } from '../index';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';
	

	let message = '';

	async function passwordReset({ formData, submitter }) {
		const { data, error } = await supabase.auth.resetPasswordForEmail(
			formData.email.toLowerCase(),
			{
				redirectTo: 'https://kine-helper.be/reset-password-token'
			}
		);
		console.log(data, error);
		if (error) {
			message = error.message;
			submitter.disabled = false;
			throw new Error(error);
		} else {
			message = get(t)('login', 'reset.help', { email: formData.email.toLowerCase() });
			submitter.innerHTML = get(t)('login', 'reset.success', {
				email: formData.email.toLowerCase()
			});
		}
	}
</script>

<FormWrapper
	formSchema={{
		isValid: passwordReset
	}}>
	<EmailField />
	<SubmitButton />
	<div class="text-center font-medium text-secondary-700">{message}</div>
</FormWrapper>
