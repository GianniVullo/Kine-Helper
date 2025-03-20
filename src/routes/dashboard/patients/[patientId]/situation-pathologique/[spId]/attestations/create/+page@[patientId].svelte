<script>
	import AttestationForm from '../../../../../../../../lib/cloud/components/forms/attestation/AttestationForm.svelte';

	let { data } = $props();

	let { sp, patient, seances, valeur_totale, total_recu, lines, prescription_id } = data;
</script>

<AttestationForm {sp} {patient} {seances} {valeur_totale} {total_recu} {lines} {prescription_id} />
