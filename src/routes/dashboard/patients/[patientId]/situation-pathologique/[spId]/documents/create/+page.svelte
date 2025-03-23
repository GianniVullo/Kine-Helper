<script>
	import { page } from '$app/stores';
	import AnnexeAForm from '../../../../../../../../lib/forms/documents/AnnexeAForm.svelte';
	import AnnexeBForm from '../../../../../../../../lib/forms/documents/AnnexeBForm.svelte';
	import { patients } from '../../../../../../../../lib/stores/PatientStore';

	let { data } = $props();
	const { patient, sp } = data;
	const docType = parseInt($page.url.searchParams.get('docType'));
	// let additionalParameters = $page.url.searchParams.get('attestationIds');
</script>

{#if docType === 0}
	<AnnexeAForm {patient} {sp} />
{/if}
{#if docType === 1}
	<AnnexeBForm {patient} {sp} />
{/if}
