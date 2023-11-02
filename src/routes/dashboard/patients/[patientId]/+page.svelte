<script>
	import { page } from '$app/stores';
	import { patients } from '$lib/stores/PatientStore';

	console.log($page.params);
	console.log($patients.find((values) => values.patient_id == $page.params.patientId));
	$: patient = $patients.find((pat) => pat.patient_id == $page.params.patientId);
</script>

<div>
	Patient subpage
</div>
