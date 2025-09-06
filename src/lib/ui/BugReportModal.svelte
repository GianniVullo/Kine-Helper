<script>
	import { supabase } from '../stores/supabaseClient';
	import SubmitButton from '../forms/ui/SubmitButton.svelte';
	import { t } from '../i18n';
	import { appState } from '../managers/AppState.svelte';
	import { Formulaire } from '../cloud/libraries/formHandler.svelte';

	// Form Data
	const request = {
		message: null,
		titre: null,
		fullName: appState.user.nom + ' ' + appState.user.prenom,
		email: appState.user.email,
		accord: null
	};

	const formSchema = {
		isValid
	};

	let formHandler = new Formulaire({
		initialValues: request,
		schema: formSchema,
		onValid: async (form) => {
			console.log('Form is valid:', form);
			await isValid({ formData: form, submitter: document.querySelector('#bug-report-submit') });
		}
	});
	async function isValid({ formData, submitter }) {
		let { data, error } = await supabase.from('user_messages').insert({
			titre: request.titre,
			message: `from <${appState.user.nom + ' ' + appState.user.prenom}> ${
				appState.user.email
			} : \n ${request.message}`,
			user_id: appState.user.id
		});
		submitter.disabled = false;
		history.back();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

<FormWrapper {formSchema}>
	<TextFieldV2 bind:value={request.fullName} label={$t('bugModal', 'label.name')} name="fullName" />
	<label for="email"
		><h5 class="text-surface-50 dark:text-surface-300">
			{$t('form.patient', 'cardLabel.contact')}
		</h5>
		<input
			id="email"
			type="email"
			class="input"
			readonly
			bind:value={request.email}
			name="email" /></label>
	<TextFieldV2
		maxlength="200"
		bind:value={request.titre}
		label={$t('bugModal', 'title')}
		name="titre" />
	<DefaultFieldWrapper>
		<label for="mess" class="text-surface-500 dark:text-surface-300 space-y-2 select-none"
			><h5>{$t('bugModal', 'label.message')}</h5>
			<textarea
				class="textarea rounded-lg"
				name="message"
				required
				bind:value={request.message}
				maxlength="2000"
				id="mess"
				cols="30"
				rows="10"></textarea
			></label>
	</DefaultFieldWrapper>
	<CheckboxFieldV2
		name="accord"
		required
		bind:value={request.accord}
		label={$t('bugModal', 'label.consent')} />
	<SubmitButton />
</FormWrapper>
