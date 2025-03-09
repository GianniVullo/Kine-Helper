<script>
	import SeanceForm from '../../../../../../../../../lib/cloud/components/forms/seances/SeanceForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	let { patient, sp, seance, prescriptions, tarifs, supplements } = data;
</script>

<SeanceForm {patient} {sp} {seance} {supplements} {tarifs} {prescriptions} mode="update" />
