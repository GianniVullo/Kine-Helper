<script>
	import { page } from '$app/stores';
	import Title from '$lib/patient-detail/Title.svelte';
	import { patients } from '$lib/index';
	import Arborescence from '../../../../lib/patient-detail/Arborescence.svelte';

	$: patient = $patients.find((pat) => pat.patient_id == $page.params.patientId);
</script>

{#if patient}
	<div class="flex flex-col items-start justify-start w-full h-full">
		<Title {patient} />
		<div class="flex flex-col md:flex-row w-full h-full">
			<Arborescence {patient} />
			<slot />
		</div>
	</div>
{:else}
	Patient n'existe pas
{/if}
