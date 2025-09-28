<script>
	import AttestationForm from '../../../../../../../../lib/components/forms/AttestationForm.svelte';

	let { data } = $props();

	let { sp, patient, seances, valeur_totale, total_recu, lines, prescription_id, numero } = data;
</script>

<AttestationForm {sp} {patient} {seances} {valeur_totale} {total_recu} {lines} {prescription_id} {numero} />
