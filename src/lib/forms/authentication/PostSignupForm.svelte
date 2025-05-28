<script>
	import { FormWrapper, TextField, SubmitButton, CheckboxField, SectionCard } from '../index';
	import IbanField from './IbanField.svelte';
	import { goto } from '$app/navigation';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';
	import { createProfile } from '../../user-ops-handlers/users';
	import { appState } from '../../managers/AppState.svelte';

	let message = '';
	let clazz = '';

	export { clazz as class };
	export let column = false;

	let formSchema = {
		isValid
	};

	async function isValid({ formData, submitter }) {
		if (!appState.db) {
			await appState.init({});
		}

		submitter.innerHTML = get(t)('shared', 'loading');
		formData.conventionne ??= false;
		await createProfile(formData);
		const { data: rawPrinter, error } = await appState.db.getRawPrinter();
		if (error) {
			message = error;
			clazz = 'text-red-500';
			submitter.innerHTML = 'Enregistrer';
			return;
		}
		submitter.innerHTML = 'OK';
		rawPrinter ? goto('/dashboard') : goto('/post-signup-forms/printer-setup');
	}
</script>

<FormWrapper class={'group/form flex flex-col space-y-2 px-4' + clazz} {formSchema}>
	<h1 class="text-surface-600">{$t('form.postSignup', 'title')}</h1>
	<p class="text-surface-500 dark:text-surface-400">
		{$t('form.postSignup', 'description')}
	</p>
	<div class:md:flex-row={!column} class="flex flex-col">
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<input type="hidden" name="user_id" value={appState.user.id} />
				<TextField
					name="nom"
					value={appState.user.nom ?? undefined}
					required
					label={$t('shared', 'name')}
					placeholder={$t('shared', 'name')} />
				<TextField
					name="prenom"
					value={appState.user.prenom ?? undefined}
					required
					label={$t('shared', 'surname')}
					placeholder={$t('shared', 'surname')} />
				<TextField
					name="adresse"
					value={appState.user.adresse ?? undefined}
					required
					placeholder={$t('shared', 'address')}
					label={$t('shared', 'address')} />
				<TextField
					name="cp"
					value={appState.user.cp ?? undefined}
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage={$t('form.postSignup', 'validation.postCode')}
					required
					placeholder={$t('form.postSignup', 'label.postCode')}
					label={$t('form.postSignup', 'label.postCode')} />
				<TextField
					name="localite"
					value={appState.user.localite ?? undefined}
					required
					placeholder={$t('form.postSignup', 'label.city')}
					label={$t('form.postSignup', 'label.city')} />
				<!-- <TextField
					name="gsm"
					value={appState.user.gsm ?? undefined}
					placeholder={$t('form.postSignup', 'label.cellPhone')}
					label={$t('form.postSignup', 'label.cellPhone')} /> -->
			</SectionCard>
		</div>
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<TextField
					name="inami"
					value={appState.user.inami ?? undefined}
					required
					pattern={/^\d{11}$/}
					patternMessage={$t('form.postSignup', 'validation.inami')}
					label="INAMI"
					placeholder="INAMI" />
				<IbanField value={appState.user.iban ?? undefined} />
				<TextField
					name="bce"
					value={appState.user.bce ?? undefined}
					required
					pattern={/^\d{10}$/}
					patternMessage={$t('form.postSignup', 'validation.bce')}
					label={$t('form.postSignup', 'label.bce')}
					placeholder={$t('form.postSignup', 'label.bce')} />
				<CheckboxField
					name="conventionne"
					value={appState.user.conventionne ?? undefined ?? true}
					checked={appState.user.conventionne ?? undefined ?? true}
					label={$t('form.postSignup', 'label.convention')} />
			</SectionCard>
			<SubmitButton class="m-4 md:m-8" />
		</div>
	</div>
	<div class="font-semibold">{message}</div>
</FormWrapper>
