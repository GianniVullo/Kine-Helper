<script>
	import { PatientForm } from '$lib/index';
	import { page } from '$app/stores';
	import { patients } from '$lib/stores/PatientStore';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
</script>

<div class="-mx-4">
	<PatientForm patient={patient} />
</div>
