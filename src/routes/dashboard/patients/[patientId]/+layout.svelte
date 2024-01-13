<script>
	import { page } from '$app/stores';
	import Title from '$lib/patient-detail/Title.svelte';
	import { patients } from '$lib/index';
	import Arborescence from '../../../../lib/patient-detail/Arborescence.svelte';
	import { setContext } from 'svelte';

	let patient =
	$patients.find((pat) => pat.patient_id == $page.params.patientId) ??
	patients.defaultTestPatient;
	setContext('patient', patient)
	console.log(patient);
</script>

{#if patient}
	<div class="flex h-full w-full flex-col items-start justify-start">
		<Title {patient} />
		{#if patient.situations_pathologiques && patient.situations_pathologiques.length > 0}
			<div class="flex h-full w-full flex-col md:flex-row">
				<Arborescence {patient} />
				<slot />
			</div>
		{:else}
			<div class="">
				<slot></slot>
			</div>
		{/if}
	</div>
{:else}
	Patient n'existe pas
{/if}
