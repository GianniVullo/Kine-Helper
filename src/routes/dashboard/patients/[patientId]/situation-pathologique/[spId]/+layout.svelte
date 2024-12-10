<script>
	import SpTitle from '../../../../../../lib/patient-detail/SPTitle.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { children } = $props();
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const currentSp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
</script>

<SpTitle {patient} {currentSp}/>
{@render children()}
