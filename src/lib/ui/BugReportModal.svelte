<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FormWrapper, TextFieldV2, DefaultFieldWrapper, CheckboxFieldV2 } from '../forms/index';
	import { user } from '../stores/UserStore';
	import { get } from 'svelte/store';
	import { supabase } from '../stores/supabaseClient';
	import SubmitButton from '../forms/ui/SubmitButton.svelte';

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
	// We've created a custom submit function to pass the response and close the modal.
	async function isValid({ formData, submitter }) {
		let { data, error } = await supabase.from('user_messages').insert({
			titre: request.titre,
			message: request.message,
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
		<header class={cHeader}>Signaler un bug/Soumettre une idée</header>
		<article>Ici vous pouvez envoyer une idée ou un signalement d'un bug</article>
		<FormWrapper {formSchema}>
			<TextFieldV2 bind:value={request.fullName} label="Nom et Prénom" name="fullName" />
			<label for="email"
				><h5 class="text-surface-50 dark:text-surface-300">Contact</h5>
				<input
					id="email"
					type="email"
					class="input"
					readonly
					bind:value={request.email}
					name="email" /></label>
			<TextFieldV2 bind:value={request.titre} label="Titre" name="titre" />
			<DefaultFieldWrapper>
				<label for="mess" class="select-none space-y-2 text-surface-500 dark:text-surface-300"
					><h5>Message</h5>
					<textarea
						class="textarea rounded-lg"
						name="message"
						required
						bind:value={request.message}
						id="mess"
						cols="30"
						rows="10"></textarea
					></label>
			</DefaultFieldWrapper>
			<CheckboxFieldV2
				name="accord"
				required
				bind:value={request.accord}
				label="Je donne mon accord pour que le développeur me contacte pour avoir de plus amples informations" />
			<SubmitButton>Envoyer</SubmitButton>
		</FormWrapper>
	</div>
{/if}
