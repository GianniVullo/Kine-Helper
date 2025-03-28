<script>
	import dayjs from 'dayjs';
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { patients } from '../stores/PatientStore';
	import { page } from '$app/stores';
	import { t } from '../i18n';
	import { ManipulateurDeSeances } from '../utils/manipulateurDeSeances';

	// <!--*--> IDÉE GÉNÉRALE
	// Pouvoir offrir une interface pour interagir avec les séances : modifier, déplacer dans le temps, supprimer, tarifier jusque là.

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sps) => sps.sp_id === $page.params.spId);
	let confirmation = false;
	$: events = sp.seances.filter(
		(s) =>
			dayjs($modalStore[0]?.meta.info.start).isBefore(dayjs(s.date)) &&
			dayjs($modalStore[0]?.meta.info.end).isAfter(dayjs(s.date))
	);

	async function deleteIfHasntBeenAttested() {
		let seancesAwaitingForSuppresion = [];
		for (const seance of events ?? []) {
			if (!seance.has_been_attested) {
				seancesAwaitingForSuppresion.push(seance);
				if ($modalStore[0].meta.component) {
					$modalStore[0].meta.component.removeEventById(seance.seance_id);
				}
			}
		}
		// On supprime l'événement du calendrier
		// On ajoute le manipulateur de séances
		let mPSs = new ManipulateurDeSeances(patient, sp);
		// on effectue la suppression
		mPSs.supprimer(seancesAwaitingForSuppresion);
		modalStore.clear();
	}
</script>

{#if $modalStore[0]}
	<div
		class="card w-modal flex flex-col border border-surface-500 p-4 shadow-xl dark:border-surface-300">
		<!--* Titre -->

		<header class="mb-1 flex items-center justify-start">
			<div class="flex w-full items-baseline justify-between">
				<div class="flex items-center justify-start">
					<h1 class="mr-4 text-2xl">
						{`${patient.nom} ${patient.prenom}`}
					</h1>
				</div>
			</div>
		</header>

		<!--* SUBHEADER SECTION -->
		<!--? Permet d'interagir avec l'objet Séance -->

		<article class="mb-4">
			<button
				on:click={() => {
					confirmation = true;
				}}
				class="variant-filled-error btn btn-sm"
				>{$t('patients.detail', 'deleteModal.confirm')}</button>
		</article>

		<!--* BODY SECTION -->
		<!--? Donne des informations sur la séance et permet sa manipulation -->
		<!--? Suppression de la séance -->
		{#if confirmation}
			<div class="flex flex-col items-start justify-start space-y-4">
				<p class="text-surface-500 dark:text-surface-300">
					{$t('otherModal', 'calendar.delete')}
				</p>
				<div class="mt-2 flex items-end justify-end space-x-2">
					<button
						on:click={() => {
							confirmation = false;
						}}
						class="variant-outline btn btn-sm">{$t('patient.create', 'back')}</button>
					<button on:click={deleteIfHasntBeenAttested} class="variant-filled-error btn btn-sm"
						>{$t('shared', 'save')}</button>
				</div>
			</div>
		{:else if Array.isArray(events) && events?.length > 0}
			{#each events as seance, i}
				<div class="flex">
					<p class="">{seance.date}</p>
				</div>
			{/each}
		{/if}
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{$t('shared', 'close')}</button>
		</footer>
	</div>
{/if}
