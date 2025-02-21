<script>
	import PrescriptionForm from '../../../../../../../../../lib/cloud/components/forms/prescription/PrescriptionForm.svelte';

	let { data } = $props();
	const { patient, sp, prescription } = data;
	console.log('In component with prescription = ', prescription);
</script>

<div class="">
	<PrescriptionForm title="Modifier la prescription" {prescription} {patient} {sp} mode="update" />
</div>
