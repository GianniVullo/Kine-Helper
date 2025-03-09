<script>
	import AttestationForm from '../../../../../../../../lib/cloud/components/forms/attestation/AttestationForm.svelte';

	let { data } = $props();
	let { sp, patient, seances } = data;
</script>

<AttestationForm {sp} {patient} {seances} />
