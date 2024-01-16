<script>
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { getContext } from 'svelte';
	import { selectPatients } from '../../../../../../../lib/stores/supabaseClient';
	import dayjs from 'dayjs';

	let patient = $page.data.patient;
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	let valueSingle = sp.prescriptions.length > 0 ? sp.prescriptions[0].prescription_id : null;
	$: selected = sp.prescriptions.find(
		(prescription) => prescription.prescription_id === valueSingle
	);
</script>

{#if sp.prescriptions.length > 0}
	<div class="flex flex-col md:flex-row">
		<ListBox>
			{#each sp.prescriptions as prescription}
				<ListBoxItem bind:group={valueSingle} name="medium" value={prescription.prescription_id}
					>prescription du {dayjs(prescription.date).format('DD/MM/YYYY')}</ListBoxItem>
			{/each}
		</ListBox>
		<div class="flex flex-col px-0 md:px-8">
			<div class="card px-8 py-4">
				<h5 class="text-lg text-surface-600 dark:text-surface-300 mb-4">
					Prescrite par {selected.prescripteur.nom + ' ' + selected.prescripteur.prenom} (inami : {selected.prescripteur.inami}), le {dayjs(selected.date).format('DD/MM/YYYY')}
				</h5>
                <p class="text-surface-800 dark:text-surface-100">
                    valable pour <span class="font-bold">{selected.nombre_seance}</span> prestations à raison de <span class="font-bold">{selected.seance_par_semaine}</span> fois par semaine.
                </p>
			</div>
			{JSON.stringify(selected)}
		</div>
	</div>
{:else}
	<p>Il n'y a pas encore de prescriptions pour cette situation pathologique.</p>
{/if}
