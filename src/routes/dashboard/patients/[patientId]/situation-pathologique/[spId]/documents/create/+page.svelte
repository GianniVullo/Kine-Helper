<script>
	import { page } from '$app/stores';
	import AnnexeAForm from '../../../../../../../../lib/forms/documents/AnnexeAForm.svelte';
	import { patients } from '../../../../../../../../lib/stores/PatientStore';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	const docType = parseInt($page.url.searchParams.get('docType'));
	// let additionalParameters = $page.url.searchParams.get('attestationIds');
</script>

{#if docType === 0}
	<AnnexeAForm {patient} {sp} />
{/if}
<!-- {#if docType === 8}
	 <Facture
{/if} -->