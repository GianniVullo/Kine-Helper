<script>
	import PatientForm from '$lib/components/forms/PatientForm.svelte';

	let { data } = $props();
</script>

<div class="-mx-4">
	<PatientForm patient={data.patient} mode="update" />
</div>
