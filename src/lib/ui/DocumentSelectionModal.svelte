<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FormWrapper, SelectFieldV2, SubmitButton, RadioFieldV2 } from '../forms/index';
	import { user } from '../stores/UserStore';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let parent;

	const modalStore = getModalStore();
	let formSchema = {
		isValid,
		validators: {}
	};

	const options = [
		{ value: 0, label: 'Annexe A' },
		{ value: 1, label: 'Annexe B' }
	];

	let formData;
	// We've created a custom submit function to pass the response and close the modal.
	function isValid() {
		goto(
			`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/documents/create?docType=${formData}`
		);
		modalStore.close();
	}

	console.log(parent);
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Signaler un bug/Soumettre une idée</header>
		<article></article>
		<FormWrapper {formSchema}>
			<!-- <SelectFieldV2 bind:value={formData} label="Types de document" required {options} /> -->
			<RadioFieldV2
				bind:value={formData}
				label="Type de document"
				name="docType"
				required
				{options} />
			<SubmitButton>Poursuivre</SubmitButton>
		</FormWrapper>
	</div>
{/if}
