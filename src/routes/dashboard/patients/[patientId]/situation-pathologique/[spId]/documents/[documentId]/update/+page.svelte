<script>
	import { page } from '$app/state';
	import AnnexeAForm from '../../../../../../../../../lib/components/forms/AnnexeAForm.svelte';
	import AnnexeBForm from '../../../../../../../../../lib/components/forms/AnnexeBForm.svelte';

	let { data } = $props();
	const { patient, sp } = data;
	const doc = sp.accords.find((doc) => doc.id === page.params.documentId);
</script>

{#if doc?.metadata.doc === 'A'}
	<AnnexeAForm {patient} {sp} {doc} />
{/if}
{#if doc?.metadata.doc === 'B'}
	<AnnexeBForm {patient} {sp} {doc} />
{/if}
