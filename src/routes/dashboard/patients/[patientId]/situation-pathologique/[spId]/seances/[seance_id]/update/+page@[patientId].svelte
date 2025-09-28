<script>
	import SeanceForm from '$lib/components/forms/SeanceForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	let { patient, sp, seance, prescriptions, tarifs, supplements } = data;
</script>

<SeanceForm {patient} {sp} {seance} {supplements} {tarifs} {prescriptions} mode="update" />
