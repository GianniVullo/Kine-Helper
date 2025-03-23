<script>
	import { patients } from '../../../../../../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import AnnexeAForm from '../../../../../../../../../lib/forms/documents/AnnexeAForm.svelte';
	import AnnexeBForm from '../../../../../../../../../lib/forms/documents/AnnexeBForm.svelte';

	let { data } = $props();
	const { patient, sp } = data;
	const doc = sp.accords.find((doc) => doc.id === $page.params.documentId);
</script>

{#if doc?.metadata.doc === 'A'}
	<AnnexeAForm {patient} {sp} {doc} />
{/if}
{#if doc?.metadata.doc === 'B'}
	<AnnexeBForm {patient} {sp} {doc} />
{/if}
