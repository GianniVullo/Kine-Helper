<script>
	import { page } from '$app/stores';
	import { PlusIcon, UpdateIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import dayjs from 'dayjs';
	import EventCalendar from '../../../../../../lib/EventCalendar.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { getEvents } from './eventFigureOuter';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import DBAdapter from '../../../../../../lib/forms/actions/dbAdapter';
	import { t } from '../../../../../../lib/i18n';
	import { tick } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore();
	const modal = {
		type: 'confirm',
		// Data
		title: get(t)('patients.detail', 'deleteModal.title'),
		body: get(t)('patients.detail', 'deleteModal.body'),
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel'),
		buttonPositive: 'variant-filled-error',
		response: async (r) => {
			if (r) {
				let db = new DBAdapter();
				await db.delete('situations_pathologiques', ['sp_id', $page.params.spId]);
				patients.update((p) => {
					let patient = p.find((p) => p.patient_id === $page.params.patientId);
					patient.situations_pathologiques = patient.situations_pathologiques.filter(
						(sp) => sp.sp_id !== $page.params.spId
					);
					return p;
				});
				goto('/dashboard/patients/' + $page.params.patientId);
			}
		}
	};
	const documentSelectionModal = {
		type: 'component',
		component: 'documentSelection'
	};
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	let items = [
		{
			name: get(t)('patients.detail', 'attestation'),
			href: $page.url.pathname + '/attestations/create',
			condition:
				sp?.seances.filter((seance) => {
					return (
						dayjs(dayjs(seance.date).format('YYYY-MM-DD')).isBefore(dayjs()) &&
						!seance.attestation_id
					);
				}).length > 0
		},
		{
			name: get(t)('patients.detail', 'prescription'),
			href: $page.url.pathname + '/prescriptions/create',
			condition: true
		},
		{
			name: get(t)('patients.detail', 'prestations'),
			href: $page.url.pathname + '/generateurs/create',
			condition: true
		}
	];
	let eventsAreLoading = false;
	let eventsPromise = new Promise(async (resolve) => {
		console.log('sp', sp);
		if (!eventsAreLoading) {
			await tick();
			eventsAreLoading = true;
			getEvents(patient, sp).then((events) => {
				eventsAreLoading = false;
				resolve(events);
			});
		} else {
			eventsAreLoading = false;
			resolve();
		}
	});
	let ec;
	console.log(sp);
</script>

<div class="px-4 flex w-full flex-col">
	<!--* Titre -->
	<div class="flex flex-col">
		<div class="flex items-center space-x-4">
			<h5 class="text-lg text-surface-500 dark:text-surface-400">
				{$t('sp.detail', 'titre', { date: dayjs(sp.created_at).format('DD/MM/YYYY') })}
			</h5>
			<div class="flex items-center space-x-2">
				<a
					href={`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/update`}
					class="variant-outline btn-icon btn-icon-sm">
					<UpdateIcon class="h-4 w-4 stroke-warning-800 dark:stroke-warning-300" />
				</a>
				<button
					on:click={() => modalStore.trigger(modal)}
					class="variant-outline btn-icon btn-icon-sm">
					<DeleteIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
				</button>
			</div>
		</div>
		<div class="flex flex-wrap space-x-2">
			{#each items as item}
				{#if item.condition}
					<a href={item.href} class="variant-outline-secondary btn btn-sm my-2 flex">
						<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
						<span class="text-sm text-surface-500 dark:text-surface-400">{item.name}</span></a>
				{/if}
			{/each}
			<button
				on:click={() => modalStore.trigger(documentSelectionModal)}
				class="variant-outline-secondary btn btn-sm my-2 flex">
				<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
				<span class="text-sm text-surface-500 dark:text-surface-400"
					>{$t('patients.detail', 'document')}</span
				></button>
		</div>
	</div>

	<!--* Add the first prescription -->
	{#if sp.prescriptions.length === 0}
		<div class="my-4 flex flex-col items-start justify-start space-y-3">
			<p>{$t('sp.detail', 'content.start')}</p>
			<a
				href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`}
				class="variant-filled-primary btn">{$t('sp.detail', 'button.start')}</a>
		</div>
	{/if}

	{#if sp.prescriptions.length > 0 && sp.seances.length === 0}
		<div class="flex flex-col items-start justify-start space-y-2 p-2">
			<p>{$t('sp.detail', 'content.start2')}</p>
			<a
				class="variant-filled-primary btn btn-sm"
				href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/generateurs/create`}
				>{$t('sp.detail', 'button.start2')}</a>
		</div>
	{/if}

	<!--* Motif et plan de la situation pathologique -->
	<div class="flex flex-col space-y-2">
		<div class="relative flex rounded-xl bg-surface-100 px-4 pb-4 pt-8 dark:bg-surface-800">
			<p class="absolute left-4 top-1 text-sm text-surface-700 dark:text-surface-400">
				{$t('sp.detail', 'reason')}
			</p>
			<p class="text-base text-surface-700 dark:text-surface-300">{sp.motif}</p>
		</div>
		<div class="relative flex rounded-xl bg-surface-100 px-4 pb-4 pt-8 dark:bg-surface-800">
			<p class="absolute left-4 top-1 text-sm text-surface-700 dark:text-surface-400">
				{$t('sp.detail', 'plan')}
			</p>
			<p class="text-base text-surface-700 dark:text-surface-300">{sp.plan_du_ttt}</p>
		</div>
	</div>

	{#if sp.seances.length > 0}
		<!--* Séances Agenda -->
		<div class="mt-4 flex w-[90%] flex-col">
			<h5 class="mb-2 text-lg text-surface-500 dark:text-surface-400">
				{$t('patients.detail', 'prestations')}
			</h5>
			{#await eventsPromise}
				{$t('shared', 'loading')} (if you see this message for more than 2 seconds, please re-enter the page through the patient list page) (It is a well known race condition bug I'm working on. Sorry about that )
			{:then events}
				<EventCalendar bind:this={ec} {events} options={{}} />
			{/await}
		</div>
	{/if}
</div>
