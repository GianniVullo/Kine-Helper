<script>
	import SeanceForm from '../../../../../../../../lib/cloud/components/forms/seances/SeanceForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	let { patient, sp, tarifs, supplements, prescriptions } = data;
</script>

<SeanceForm {patient} {sp} {tarifs} {supplements} {prescriptions} />
