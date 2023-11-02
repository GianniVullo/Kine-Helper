<script>
	import { PatientForm } from '$lib/index';
	import { patients } from '$lib/stores/PatientStore';
	import { page } from '$app/stores';

	$: patient = $patients.find((pat) => pat.patient_id == $page.params.patientId);
</script>

<div class="-mx-4">
	<PatientForm {patient} />
</div>
