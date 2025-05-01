<script>
	import MultipleSeanceForm from '../../../../../../../../lib/cloud/components/forms/seances/MultipleSeanceForm.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	let { patient, sp, tarifs, supplements, prescriptions } = data;
</script>

<MultipleSeanceForm {patient} {sp} {tarifs} {supplements} {prescriptions} />
