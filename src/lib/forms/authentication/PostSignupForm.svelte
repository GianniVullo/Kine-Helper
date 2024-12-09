<script>
	import { FormWrapper, TextField, SubmitButton, CheckboxField, SectionCard } from '../index';
	import IbanField from './IbanField.svelte';
	import { user } from '$lib/index';
	import { supabase } from '../../stores/supabaseClient';
	import { goto } from '$app/navigation';
	import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
	import { t } from '../../i18n';
	import { get } from 'svelte/store';
	import { LocalDatabase } from '../../stores/databaseInitializer';
	import { invoke } from '@tauri-apps/api/core';
	import { createUser } from '../../user-ops-handlers/users';
	import { retrieveSettings } from '../../user-ops-handlers/settings';
	let message = '';
	let clazz = '';
	export { clazz as class };
	export let column = false;
	let formSchema = {
		isValid: isValid
	};

	async function isValid({ formData, submitter }) {
		console.log('in isValid with', formData);
		submitter.innerHTML = get(t)('shared', 'loading');
		formData.conventionne ??= false;
		await createUser(formData);
		await retrieveSettings({ user_id: get(user).user.id });
		submitter.innerHTML = 'OK';
		$user.settings.raw_printer ? goto('/dashboard') : goto('/post-signup-forms/printer-setup');
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
				<input type="hidden" name="id" value={$user.user.id} />
				<TextField
					name="nom"
					value={$user.profil?.nom ?? undefined}
					required
					label={$t('shared', 'name')}
					placeholder={$t('shared', 'name')} />
				<TextField
					name="prenom"
					value={$user.profil?.prenom ?? undefined}
					required
					label={$t('shared', 'surname')}
					placeholder={$t('shared', 'surname')} />
				<TextField
					name="adresse"
					value={$user.profil?.adresse ?? undefined}
					required
					placeholder={$t('shared', 'address')}
					label={$t('shared', 'address')} />
				<TextField
					name="cp"
					value={$user.profil?.cp ?? undefined}
					type="number"
					pattern={/^[0-9]{4}$/}
					patternMessage={$t('form.postSignup', 'validation.postCode')}
					required
					placeholder={$t('form.postSignup', 'label.postCode')}
					label={$t('form.postSignup', 'label.postCode')} />
				<TextField
					name="localite"
					value={$user.profil?.localite ?? undefined}
					required
					placeholder={$t('form.postSignup', 'label.city')}
					label={$t('form.postSignup', 'label.city')} />
				<TextField
					name="gsm"
					value={$user.profil?.gsm ?? undefined}
					placeholder={$t('form.postSignup', 'label.cellPhone')}
					label={$t('form.postSignup', 'label.cellPhone')} />
			</SectionCard>
		</div>
		<div class="w-full p-2 md:p-4 lg:p-8">
			<SectionCard>
				<TextField
					name="inami"
					value={$user.profil?.inami ?? undefined}
					required
					pattern={/^\d{11}$/}
					patternMessage={$t('form.postSignup', 'validation.inami')}
					label="INAMI"
					placeholder="INAMI" />
				<IbanField value={$user.profil?.iban ?? undefined} />
				<TextField
					name="bce"
					value={$user.profil?.bce ?? undefined}
					required
					pattern={/^\d{10}$/}
					patternMessage={$t('form.postSignup', 'validation.bce')}
					label={$t('form.postSignup', 'label.bce')}
					placeholder={$t('form.postSignup', 'label.bce')} />
				<CheckboxField
					name="conventionne"
					value={$user.profil?.conventionne ?? undefined ?? true}
					checked={$user.profil?.conventionne ?? undefined ?? true}
					label={$t('form.postSignup', 'label.convention')} />
			</SectionCard>
			<SubmitButton class="m-4 md:m-8" />
		</div>
	</div>
	<div class="font-semibold">{message}</div>
</FormWrapper>
