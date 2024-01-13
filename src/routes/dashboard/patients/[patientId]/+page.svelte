<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { patients } from '$lib/stores/PatientStore';
	import { getContext } from 'svelte';

	console.log($page.params);
	let patient = getContext('patient');
	let sps =
		patient.situations_pathologiques !== undefined && patient.situations_pathologiques.length > 0;
	console.log('sps equal', sps);
	if (sps) {
		goto(
			'/dashboard/patients/' +
				$page.params.patientId +
				'/situation-pathologique/' +
				patient.situations_pathologiques[0]?.sp_id
		);
	}
</script>

{#if !sps}
	<div class="mt-12 flex flex-col items-start justify-start">
		<h1 class="mb-3 text-lg">Pour commencer, ajoutez une</h1>
		<div>
			<a
				href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/create`}
				class="variant-filled-primary btn">
				Nouvelle situation pathologique
			</a>
		</div>
	</div>
{/if}
