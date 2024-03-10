<script>
	import AttestationUpdateForm from '../../../../../../../../../lib/forms/attestation/AttestationUpdateForm.svelte';
	import { patients } from '../../../../../../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import { t } from '../../../../../../../../../lib/i18n';
	import { fetchCodeDesSeances } from '../../../../../../../../../lib/utils/nomenclatureManager';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	const attestation = sp.attestations.find((a) => a.attestation_id === $page.params.attestationId);

	const codePromise = fetchCodeDesSeances(
		null,
		sp.seances.filter((s) => s.attestation_id === attestation.attestation_id),
		sp
	);
</script>

{#await codePromise}
	<p>{$t('shared', 'loading')}</p>
{:then codes}
	<AttestationUpdateForm {attestation} {codes} />
{/await}
