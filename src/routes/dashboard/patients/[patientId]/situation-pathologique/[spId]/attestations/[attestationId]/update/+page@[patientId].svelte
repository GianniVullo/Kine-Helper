<script>
	import AttestationForm from '../../../../../../../../../lib/cloud/components/forms/attestation/AttestationForm.svelte';
	import { page } from '$app/stores';
	import { t } from '../../../../../../../../../lib/i18n';
	import { fetchCodeDesSeances } from '../../../../../../../../../lib/utils/nomenclatureManager';

	let { data } = $props();
	let { patient, sp } = data;
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
	<AttestationForm {attestation} {codes} />
{/await}
