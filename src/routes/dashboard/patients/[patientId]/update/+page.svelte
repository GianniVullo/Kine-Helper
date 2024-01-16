<script>
	import { PatientForm } from '$lib/index';
	import { page } from '$app/stores';
</script>

<div class="-mx-4">
	<PatientForm patient={$page.data.patient} />
</div>
