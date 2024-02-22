<script>
	import Title from '$lib/patient-detail/Title.svelte';
	import Arborescence from '../../../../lib/patient-detail/Arborescence.svelte';
	import { patients } from '../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);

	let spPromied = new Promise((resolve) => {
		if (patient.situations_pathologiques.length == 0) {
			patients.getLastSpAndOthers(patient.patient_id).then(() => {
				resolve();
			});
		} else {
			resolve();
		}
	});

	console.log(patient);
</script>

{#if patient}
	{#await spPromied}
		CHARGEMENT...
	{:then value}
		<div class="flex h-full w-full flex-col items-start justify-start">
			<Title {patient} />
			{#if patient.situations_pathologiques && patient.situations_pathologiques.length > 0}
				<div class="flex h-full w-full flex-col md:flex-row">
					<Arborescence {patient} />
					<slot />
				</div>
			{:else}
				<div class="">
					<slot />
				</div>
			{/if}
		</div>
	{/await}
{:else}
	Patient n'existe pas
{/if}
