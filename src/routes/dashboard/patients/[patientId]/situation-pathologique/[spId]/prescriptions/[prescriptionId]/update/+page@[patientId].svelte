<script>
	import PrescriptionForm from '../../../../../../../../../lib/components/forms/PrescriptionForm.svelte';


	let { data } = $props();
	const { patient, sp, prescription } = data;
	console.log('In component with prescription = ', prescription);
</script>

<div class="">
	<PrescriptionForm title="Modifier la prescription" {prescription} {patient} {sp} mode="update" />
</div>
