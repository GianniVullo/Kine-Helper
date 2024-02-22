<script>
	import { page } from '$app/stores';
	import { patients } from '$lib/stores/PatientStore';
	import PrescriptionForm from '$lib/forms/prescription/PrescriptionForm.svelte';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
</script>

<div class="flex flex-col">
	<h3 class="text-xl font-medium text-surface-300 dark:text-surface-500">
		Création d'une nouvelle prescription
	</h3>
	<PrescriptionForm {patient} {sp}  />
</div>
