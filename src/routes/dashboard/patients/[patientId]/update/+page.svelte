<script>
	import PatientForm from "../../../../../lib/cloud/components/forms/patient/PatientForm.svelte";

	let { data } = $props();
</script>

<div class="-mx-4">
	<PatientForm patient={data.patient} mode="update" />
</div>
