<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
    import { FormWrapper, TextFieldV2, DefaultFieldWrapper, CheckboxFieldV2 } from "../forms/index";
    import { user} from "../stores/UserStore";
	import { get } from 'svelte/store';

	export let parent;

	const modalStore = getModalStore();

	// Form Data
	const formData = {
		message: null,
        fullName: get(user).profil.nom + " " + get(user).profil.prenom,
        accord: true
	};

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit() {
		if ($modalStore[0].response) $modalStore[0].response(formData);
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
		<article></article>
        <FormWrapper>
            <TextFieldV2 bind:value={formData.fullName} label="Nom et Prénom" />
            <DefaultFieldWrapper>
                <label for="mess" class="text-surface-500 dark:text-surface-300 select-none space-y-2"><h5>Message</h5><textarea class="textarea rounded-lg" name="message" required bind:value={formData.message} id="mess" cols="30" rows="10"></textarea></label>
            </DefaultFieldWrapper>
            <CheckboxFieldV2 bind:value={formData.accord} label="Je donne mon accord pour que le développeur me contacte pour avoir de plus amples informations" />
        </FormWrapper>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>Submit Form</button>
		</footer>
	</div>
{/if}