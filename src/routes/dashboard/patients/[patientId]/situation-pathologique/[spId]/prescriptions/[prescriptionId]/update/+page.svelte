<script>
	import PrescriptionForm from '$lib/forms/prescription/PrescriptionForm.svelte';
	import { patients } from '$lib/stores/PatientStore';
	import { page } from '$app/stores';

	const patient = $patients.find((patient) => patient.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	const prescription = sp.prescriptions.find(
		(prescription) => prescription.prescription_id === $page.params.prescriptionId
	);
</script>

<div class="">
	<PrescriptionForm {prescription} {patient} {sp} />
</div>
