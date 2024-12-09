<script>
	import { getModalStore, popup } from '@skeletonlabs/skeleton';
	import dayjs from 'dayjs';
	import { EuroIcon, TableCellIcon, UpdateIcon } from '../ui/svgs/index';
	import { goto } from '$app/navigation';
	import { patients } from '../stores/PatientStore';
	import DBAdapter from '$lib/user-ops-handlers/dbAdapter';	import { tick } from 'svelte';
	import { t } from '../i18n';
	import { ManipulateurDeSeances } from '../utils/manipulateurDeSeances';

	const modalStore = getModalStore();
	// <!--*--> IDÉE GÉNÉRALE
	// Pouvoir offrir une interface pour interagir avec les séances : modifier, déplacer dans le temps, supprimer, tarifier jusque là.

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	let patient = $patients.find(
		(p) => p.patient_id === $modalStore[0]?.meta.event.extendedProps.seance.patient_id
	);
	let modification = false;

	$: event = $modalStore[0]?.meta.event;
	const attestedPopup = {
		event: 'hover',
		target: 'attestedPopup',
		placement: 'top'
	};
	const paidPopup = {
		event: 'hover',
		target: 'paidPopup',
		placement: 'top'
	};

	let description;
	let report;
	let date;
	let heure;
	let deletion;
	let textarea;
	async function performDescriptionUpdate() {
		let db = new DBAdapter();
		let result = await db.update('seances', [['seance_id', event.extendedProps.seance.seance_id]], {
			...event.extendedProps.seance,
			description
		});
		console.log('result from performDescriptionUpdate', result);
		event.extendedProps.seance.description = description;
		patients.update((p) => {
			let patient = p.find((p) => p.patient_id === event.extendedProps.seance.patient_id);
			let sp = patient.situations_pathologiques.find(
				(sp) => sp.sp_id === event.extendedProps.seance.sp_id
			);
			let seance = sp.seances.find((s) => s.seance_id === event.extendedProps.seance.seance_id);
			seance.description = description;
			return p;
		});
	}
	async function performDateTimeUpdate() {
		let newDate = dayjs(`${date} ${heure}`).format('YYYY-MM-DD HH:mm');
		const sp = patient.situations_pathologiques.find(
			(sp) => sp.sp_id === event.extendedProps.seance.sp_id
		);
		// On ajoute le manipulateur de séances ici
		let mPSs = new ManipulateurDeSeances(patient, sp);
		// on effectue la mise à jour
		mPSs.reporter(event.extendedProps.seance, newDate);
		// mettre à jour le composant Calendrier au travers des attributs, start et end
		// pour ça, il faut d'abord trouver la durée en soustrayant la date de fin à la date de début.
		let delta = dayjs(event.end).diff(dayjs(event.start), 'minute');
		event.start = newDate;
		event.end = dayjs(newDate).add(delta, 'minute').format('YYYY-MM-DD HH:mm');
		if ($modalStore[0].meta.component) {
			$modalStore[0].meta.component.updateEvent(event);
		}
		//? Une Mise à jour du patients store est inutile ici car le store est mis à jour dans le manipulateur de séances
		modalStore.clear();
	}
	async function deleteIfHasntBeenAttested() {
		if (!event.extendedProps.seance.has_been_attested) {
			const sp = patient.situations_pathologiques.find(
				(sp) => sp.sp_id === event.extendedProps.seance.sp_id
			);
			const seanceToDelete = event.extendedProps.seance;
			// On supprime l'événement du calendrier
			if ($modalStore[0].meta.component) {
				$modalStore[0].meta.component.removeEventById(event.extendedProps.seance.seance_id);
			}
			// On ajoute le manipulateur de séances
			let mPSs = new ManipulateurDeSeances(patient, sp);
			// on effectue la suppression
			mPSs.supprimer(seanceToDelete);
			modalStore.clear();
		}
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
						{$t('otherModal', 'calendar.title', {
							patientFullName: `${patient.nom} ${patient.prenom}`
						})}
					</h1>
					<!--? Informations supplémentaires -->
					<div use:popup={attestedPopup}>
						<TableCellIcon
							class="mr-2 h-6 w-6 {event.extendedProps.seance.has_been_attested
								? 'stroke-success-500'
								: 'stroke-error-500'}" />
					</div>
					<div data-popup="attestedPopup">
						<div class="card variant-filled-surface p-2">
							<p class="text-xs">
								{event.extendedProps.seance.is_paid ? 'Attestée' : 'Non attestée'}
							</p>
							<div class="variant-filled-surface arrow" />
						</div>
					</div>
					{#if event.extendedProps.seance.has_been_attested}
						<div use:popup={paidPopup}>
							<EuroIcon
								class="h-6 w-6 {event.extendedProps.seance.is_paid
									? 'stroke-success-500'
									: 'stroke-error-500'}" />
						</div>
						<div data-popup="paidPopup">
							<div class="card variant-filled-surface p-2">
								<p class="text-xs">{event.extendedProps.seance.is_paid ? 'Payée' : 'Non payée'}</p>
								<div class="variant-filled-surface arrow" />
							</div>
						</div>
					{/if}
				</div>
				<h5>
					le {dayjs(event.start).format('DD/MM/YYYY')} à {dayjs(
						event.extendedProps.seance.date
					).format('HH:mm')}
				</h5>
			</div>
		</header>

		<!--* SUBHEADER SECTION -->
		<!--? Permet d'interagir avec l'objet Séance -->

		<article class="mb-4">
			{#if !event.extendedProps.seance.has_been_attested || !event.extendedProps.seance.attestation_id}
				<button
					on:click={() => {
						report = true;
						modification = false;
						deletion = false;
						date = dayjs(event.extendedProps.seance.date).format('YYYY-MM-DD');
						heure = dayjs(event.extendedProps.seance.date).format('HH:mm');
					}}
					class="variant-filled btn btn-sm">{$t('otherModal', 'calendarcontrols.report')}</button>
				<button
					on:click={() => {
						modalStore.clear();
						goto(
							`/dashboard/patients/${event.extendedProps.seance.patient_id}/situation-pathologique/${event.extendedProps.seance.sp_id}/attestations/create?untill=${event.extendedProps.seance.date}`
						);
					}}
					class="variant-filled-secondary btn btn-sm"
					>{$t('otherModal', 'calendarcontrols.bill')}</button>
			{/if}
			{#if !event.extendedProps.seance.has_been_attested}
				<button
					on:click={() => {
						report = false;
						modification = false;
						deletion = true;
					}}
					class="variant-filled-error btn btn-sm"
					>{$t('patients.detail', 'deleteModal.confirm')}</button>
			{/if}
		</article>

		<!--* BODY SECTION -->
		<!--? Donne des informations sur la séance et permet sa manipulation -->

		<!--? Changement de la date et de l'heure -->
		{#if report}
			<div class="flex flex-col items-start justify-start space-y-4">
				<label for="dateSeance" class="space-y-2">
					<p class="select-none text-sm text-surface-500 dark:text-surface-300">
						{$t('otherModal', 'calendar.dateinput')}
					</p>
					<input bind:value={date} class="input" type="date" name="date" id="dateSeance" /></label>
				<label for="heureSeance" class="space-y-2">
					<p class="select-none text-sm text-surface-500 dark:text-surface-300">
						{$t('otherModal', 'calendar.timeinput')}
					</p>
					<input
						bind:value={heure}
						class="input"
						type="time"
						name="heure"
						id="heureSeance" /></label>
				<div class="flex items-end justify-end space-x-2">
					<button
						on:click={() => {
							report = false;
						}}
						class="variant-outline btn btn-sm mt-2">{$t('patient.create', 'back')}</button>
					<button
						on:click={async () => {
							await performDateTimeUpdate();
							report = false;
						}}
						class="variant-filled-primary btn btn-sm">{$t('shared', 'save')}</button>
				</div>
			</div>
		{:else if modification}
			<!--? Changement de la description de la séance -->
			<article class="relative mb-4 flex rounded-xl bg-surface-200 p-6 dark:bg-surface-700">
				<h5 class="absolute left-1 top-1 text-xs text-surface-400">
					{$t('otherModal', 'calendar.description')}
				</h5>
				<div class:hidden={!modification} class="flex flex-col space-y-2">
					<textarea
						bind:this={textarea}
						class="textarea w-[100%] rounded-lg"
						bind:value={description}
						name="description"
						id="description"
						rows="10"
						cols="500"></textarea>
					<div class="flex space-x-2 p-2">
						<button
							on:click={() => {
								modification = false;
							}}
							class="variant-outline btn btn-sm">{$t('patient.create', 'back')}</button>
						<button
							on:click={async () => {
								await performDescriptionUpdate();
								modification = false;
							}}
							class="variant-filled-primary btn btn-sm">{$t('shared', 'save')}</button>
					</div>
				</div>
			</article>
		{:else if deletion}
			<!--? Suppression de la séance -->
			<div class="flex flex-col items-start justify-start space-y-4">
				<p class="text-surface-500 dark:text-surface-300">
					{$t('otherModal', 'calendar.delete')}
				</p>
				<div class="mt-2 flex items-end justify-end space-x-2">
					<button
						on:click={() => {
							deletion = false;
						}}
						class="variant-outline btn btn-sm">{$t('patient.create', 'back')}</button>
					<button on:click={deleteIfHasntBeenAttested} class="variant-filled-error btn btn-sm"
						>{$t('shared', 'save')}</button>
				</div>
			</div>
		{:else}
			<article class="relative mb-4 flex rounded-xl bg-surface-200 p-6 dark:bg-surface-700">
				<h5 class="absolute left-1 top-1 text-xs text-surface-400">
					{$t('otherModal', 'calendar.description')}
				</h5>
				<p>
					{event.extendedProps.seance.description ?? $t('otherModal', 'calendar.description.empty')}
				</p>
				<button
					on:click={async () => {
						description = event.extendedProps.seance.description;
						modification = true;
						await tick();
						textarea.focus();
					}}>
					<UpdateIcon
						class="absolute right-1 top-1 h-4 w-4 stroke-warning-800 dark:stroke-warning-400" />
				</button>
			</article>
		{/if}

		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}
				>{$t('shared', 'close')}</button>
		</footer>
	</div>
{/if}
