<script>
	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { FormWrapper, SubmitButton, RadioFieldV2 } from '../forms/index';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { t } from '../i18n';
	import { get } from 'svelte/store';

	export let parent;

	const modalStore = getModalStore();
	let formSchema = {
		isValid,
		validators: {}
	};

	const options = [
		{ value: 0, label: get(t)('shared', 'annexe') + ' A' },
		{ value: 1, label: get(t)('shared', 'annexe') + ' B' }
	];

	let formData;
	// We've created a custom submit function to pass the response and close the modal.
	function isValid() {
		goto(
			`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/documents/create?docType=${formData}`
		);
		modalStore.close();
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$t('otherModal', 'doc.create')}</header>
		<article></article>
		<FormWrapper {formSchema}>
			<!-- <SelectFieldV2 bind:value={formData} label="Types de document" required {options} /> -->
			<RadioFieldV2
				bind:value={formData}
				label={$t('otherModal', 'doc.type')}
				name="docType"
				required
				{options} />
			<SubmitButton>{$t('shared', 'confirm')}</SubmitButton>
		</FormWrapper>
	</div>
{/if}
