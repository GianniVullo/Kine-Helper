<script>
	import { page } from '$app/stores';
	import { PlusIcon, UpdateIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import dayjs from 'dayjs';
	import EventCalendar from '../../../../../../lib/EventCalendar.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { t } from '../../../../../../lib/i18n';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { deleteSituationPathologique } from '../../../../../../lib/user-ops-handlers/situations_pathologiques';
	import EmptyState from '../../../../../../lib/components/EmptyState.svelte';

	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	// let items = [
	// 	{
	// 		name: get(t)('patients.detail', 'attestation'),
	// 		href: $page.url.pathname + '/attestations/create',
	// 		condition:
	// 			sp?.seances.filter((seance) => {
	// 				return (
	// 					dayjs(dayjs(seance.date).format('YYYY-MM-DD')).isBefore(dayjs()) &&
	// 					!seance.attestation_id
	// 				);
	// 			}).length > 0
	// 	},
	// 	{
	// 		name: get(t)('patients.detail', 'prescription'),
	// 		href: $page.url.pathname + '/prescriptions/create',
	// 		condition: true
	// 	},
	// 	{
	// 		name: get(t)('patients.detail', 'prestations'),
	// 		href: $page.url.pathname + '/generateurs/create',
	// 		condition: true
	// 	}
	// ];
</script>

<div class="flex w-full flex-col">
	<!-- <div class="flex flex-col">
		<div class="flex flex-wrap space-x-2">
			{#each items as item}
				{#if item.condition}
					<a href={item.href} class="variant-outline-secondary btn btn-sm my-2 flex">
						<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
						<span class="text-sm text-surface-500 dark:text-surface-400">{item.name}</span></a>
				{/if}
			{/each}
			<button
				onclick={() => modalStore.trigger(documentSelectionModal)}
				class="variant-outline-secondary btn btn-sm my-2 flex">
				<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
				<span class="text-sm text-surface-500 dark:text-surface-400"
					>{$t('patients.detail', 'document')}</span
				></button>
		</div>
	</div> -->

	<!--* Add the first prescription -->
	{#if sp.prescriptions.length === 0}
		<EmptyState
			className="!text-start"
			titre={$t('sp.detail', 'content.start') + ' ' + $t('sp.detail', 'button.start').toLowerCase()}
			buttonText={'New Prescription'}
			onclick={() => {
				goto(
					`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`
				);
			}}>
			{#snippet icon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-12 text-gray-400">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
				</svg>
			{/snippet}
		</EmptyState>
	{/if}

	{#if sp.prescriptions.length > 0 && sp.seances.length === 0}
		<EmptyState
			className="!text-start"
			titre={$t('sp.detail', 'content.start') + ' ' + $t('sp.detail', 'button.start2').toLowerCase()}
			buttonText={'Generate séance'}
			onclick={() => {
				goto(
					`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/generateurs/create`
				);
			}}>
			{#snippet icon()}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-12 text-gray-400">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
				</svg>
			{/snippet}
		</EmptyState>
	{/if}

	Ajouter des overview de la situation pathologique : Où on en est dans le traitement, dans la facturation
	etc (bref toutes les données que je pensais compiler dan l'object sp)
	<!--* Motif et plan de la situation pathologique -->
	<!-- <div class="flex flex-col space-y-2">
		<div class="relative flex rounded-xl bg-surface-100 px-4 pb-4 pt-8 dark:bg-surface-800">
			<p class="absolute left-4 top-1 text-sm text-surface-400">
				{$t('sp.detail', 'reason')}
			</p>
			<p class="text-base text-surface-700 dark:text-surface-300">{sp.motif}</p>
		</div>
		<div class="relative flex rounded-xl bg-surface-100 px-4 pb-4 pt-8 dark:bg-surface-800">
			<p class="absolute left-4 top-1 text-sm text-surface-400">
				{$t('sp.detail', 'plan')}
			</p>
			<p class="text-base text-surface-700 dark:text-surface-300">{sp.plan_du_ttt}</p>
		</div>
	</div>
 -->
	<!--* Séances Agenda -->
	<!-- {#if sp.seances.length > 0}
		<div class="mt-4 flex w-[90%] flex-col">
			<h5 class="mb-2 text-lg text-surface-500 dark:text-surface-400">
				{$t('patients.detail', 'prestations')} ({sp.seances.length})
			</h5>
			{#key eventsSource}
				{#await eventsSource}
					{$t('shared', 'loading')}
				{:then events}
					<EventCalendar bind:this={ec} {events} options={{}} />
				{/await}
			{/key}
		</div>
	{/if} -->
</div>
