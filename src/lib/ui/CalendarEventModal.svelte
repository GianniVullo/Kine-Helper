<script>
	import { t } from '../i18n';
	import { appState } from '../managers/AppState.svelte';
	import BoutonPrincipalAvecIcone from '../components/BoutonPrincipalAvecIcone.svelte';
	import { editIcon, euroIcon } from './svgs/IconSnippets.svelte';
	import BoutonSecondaireAvecIcone from '../components/BoutonSecondaireAvecIcone.svelte';
	import BoutonPrincipal from '../components/BoutonPrincipal.svelte';
	import dayjs from 'dayjs';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	let { ec, deleteSeance } = $props();
	let seance = $derived(page.state.drawer?.seance);
	let deletion = $state(false);
</script>

{#if seance}
	{#await new Promise(async (resolve, reject) => {
		if (seance) {
			await appState.init({});
			let { data: patient, error } = await appState.db.retrievePatient(seance.patient_id);
			if (error) {
				/**
				 * TODO Need to add proper error handling here, not critical tho as it should never break fataly here (users can still access the responsiveSidebar and reset the state)
				 */
				console.error(error);
			}
			if (!patient) {
				patient = 'none';
			}

			let sp;
			const { data, error: err2 } = await appState.db.retrieve_sp({ sp_id: seance.sp_id });
			if (err2) {
				/**
				 * TODO Need to add proper error handling here, not critical tho as it should never break fataly here (users can still access the responsiveSidebar and reset the state)
				 */
				console.error(err2);
			}
			sp = data;
			if (!sp) {
				sp = 'none';
			}

			resolve({ patient, sp });
		} else {
			reject('No Seance yet');
		}
	}) then { patient, sp }}
		<div class="">
			<!--* Titre -->

			<header class="mb-1 flex items-center justify-start">
				<div class="flex w-full flex-col items-baseline justify-between">
					<div class="flex items-center justify-start">
						<h1 class="mr-4 text-base">
							{`${patient.nom} ${patient?.prenom ?? '?'}`}
						</h1>
					</div>
					<h5 class="text-sm text-gray-500">
						le {seance.date} à {seance.start}
					</h5>
				</div>
			</header>

			<!--* SUBHEADER SECTION -->
			<!--? Permet d'interagir avec l'objet Séance -->

			<article class="mb-4">
				{#if !seance.has_been_attested && !seance.attestation_id}
					<BoutonPrincipalAvecIcone
						size="sm"
						inner="Modifier"
						href={'/dashboard/patients/' +
							seance.patient_id +
							'/situation-pathologique/' +
							seance.sp_id +
							'/seances/' +
							seance.seance_id +
							'/update'}>
						{#snippet icon(cls)}
							{@render editIcon('text-yellow-500 size-5 -ml-0.5 mr-1.5')}
						{/snippet}

						Modifier</BoutonPrincipalAvecIcone>
					<BoutonSecondaireAvecIcone
						size="sm"
						onclick={() => {
							goto(
								`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create-${dayjs(
									seance.date
								).format('YYYY-MM-DD')}`
							);
						}}
						inner={$t('otherModal', 'calendarcontrols.bill')}>
						{#snippet icon(cls)}
							{@render euroIcon('text-secondary-500 size-5 -ml-0.5 mr-1.5')}
						{/snippet}
					</BoutonSecondaireAvecIcone>
				{/if}
				{#if !page.state.drawer?.event.extendedProps.seance.has_been_attested}
					<BoutonSecondaireAvecIcone
						size="sm"
						className="inline-flex items-center bg-white text-sm font-medium text-red-900 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 duration-500 self-end"
						onclick={() => {
							deletion = true;
						}}
						inner={$t('patients.detail', 'deleteModal.confirm')}>
						{#snippet icon(cls)}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="mr-1.5 -ml-0.5 size-5 text-red-400">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						{/snippet}
					</BoutonSecondaireAvecIcone>
				{/if}
			</article>

			<!--* BODY SECTION -->
			<!--? Donne des informations sur la séance et permet sa manipulation -->

			<!--? Changement de la date et de l'heure -->
			{#if deletion}
				<!--? Suppression de la séance -->
				<div class="flex flex-col items-start justify-start space-y-4">
					<p class="text-surface-500 dark:text-surface-300">
						{$t('otherModal', 'calendar.delete')}
					</p>
					<div class="mt-2 flex items-end justify-end space-x-2">
						<button
							onclick={() => {
								deletion = false;
							}}
							class="variant-outline btn btn-sm">{$t('patient.create', 'back')}</button>
						<BoutonPrincipal
							onclick={async () => {
								console.log('Calling the deleteSeance');

								await deleteSeance({ detail: { seanceId: seance.seance_id } });
								ec.removeEventById(seance.seance_id);

								replaceState('', { drawer: null });
							}}
							size="sm"
							color="error">{$t('patients.detail', 'deleteModal.confirm')}</BoutonPrincipal>
					</div>
				</div>
			{/if}
		</div>
	{:catch error}
		{error}
	{/await}
{/if}
