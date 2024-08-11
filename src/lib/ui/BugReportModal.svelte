<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FormWrapper, TextFieldV2, DefaultFieldWrapper, CheckboxFieldV2 } from '../forms/index';
	import { user } from '../stores/UserStore';
	import { get } from 'svelte/store';
	import { supabase } from '../stores/supabaseClient';
	import SubmitButton from '../forms/ui/SubmitButton.svelte';
	import { t } from '../i18n';

	export let parent;

	const modalStore = getModalStore();

	// Form Data
	const request = {
		message: null,
		titre: null,
		fullName: get(user).profil.nom + ' ' + get(user).profil.prenom,
		email: get(user).user.email,
		accord: null
	};

	const formSchema = {
		isValid
	};

	async function isValid({ formData, submitter }) {
		let { data, error } = await supabase.from('user_messages').insert({
			titre: request.titre,
			message: `from <${get(user).profil.nom + ' ' + get(user).profil.prenom}> ${
				get(user).user.email
			} : \n ${request.message}`,
			user_id: $user.user.id
		});

		console.log('data', data);
		console.log('error', error);
		console.log('formData', formData);
		console.log('submiter', submitter);
		submitter.disabled = false;
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$t('sidebar', 'bugReport')}</header>
		<article>{$t('bugModal', 'description')}</article>
		<FormWrapper {formSchema}>
			<TextFieldV2
				bind:value={request.fullName}
				label={$t('bugModal', 'label.name')}
				name="fullName" />
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
				<label for="mess" class="select-none space-y-2 text-surface-500 dark:text-surface-300"
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
	</div>
{/if}
