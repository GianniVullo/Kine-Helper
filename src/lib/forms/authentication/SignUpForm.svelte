<script>
	import { supabase } from '../../stores/supabaseClient';
	import { user } from '$lib/stores/UserStore';
	import EmailField from './EmailField.svelte';
	import PasswordField from './PasswordField.svelte';
	import { SubmitButton, FormWrapper } from '../index';
	import { createEventDispatcher } from 'svelte';
	import { get } from 'svelte/store';
	import { t } from '../../i18n';

	let message = '';

	const dispatch = createEventDispatcher();

	let formSchema = {
		isValid: signUp,
		validators: {
			password2: {
				fn: (value) => {
					return (
						document.getElementById('password').value == document.getElementById('password2').value
					);
				},
				errorMessage: get(t)('signup', 'passwordsDontMatch')
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
			throw new Error(error);
		} else {
			message = get(t)('signup', 'emailConfirmation', { email: formData.email.toLowerCase() });
			user.set({
				user: data.user,
				session: data.session
			});
			dispatch('onSignupSuccess', {
				message
			});
			submitter.disabled = false;
		}
	}
</script>

<FormWrapper {formSchema}>
	<EmailField />
	<PasswordField />
	<PasswordField name="password2" />
	<div class="font-semibold">{message}</div>
	<SubmitButton>{$t('login', 'controls.signup')}</SubmitButton>
</FormWrapper>
