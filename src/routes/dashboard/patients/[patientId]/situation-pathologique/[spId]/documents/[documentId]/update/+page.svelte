<script>
	import { page } from '$app/state';
	import AccordForm from '../../../../../../../../../lib/components/forms/AccordForm.svelte';

	let { data } = $props();
	const { patient, sp } = data;
	const doc = sp.accords.find((doc) => doc.id === page.params.documentId);
</script>

{#if doc?.metadata.doc === 'A'}
	<AccordForm {patient} {sp} docType="A" />
	{/if}
	{#if doc?.metadata.doc === 'B'}
	<AccordForm {patient} {sp} docType="B" />
{/if}
