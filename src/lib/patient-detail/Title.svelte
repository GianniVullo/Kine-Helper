<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/index';
	import { patients } from '$lib/stores/PatientStore';
	import UpdateIcon from '$lib/ui/svgs/UpdateIcon.svelte';
	import DeleteIcon from '$lib/ui/svgs/DeleteIcon.svelte';
	import InfoIcon from '$lib/ui/svgs/InfoIcon.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import ArchiveIcon from '$lib/ui/svgs/ArchiveIcon.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import DBAdapter from '../forms/actions/dbAdapter';
	import { t } from '../i18n';
	import { get } from 'svelte/store';

	const modalStore = getModalStore();
	const modal = {
		type: 'confirm',
		// Data
		title: get(t)('patients.detail', 'pdeleteModal.title'),
		body: get(t)('patients.detail', 'pdeleteModal.body'),
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel'),
		modalClasses: {
			buttonPositive: 'isModal'
		},
		// buttonPositive: 'isModal',
		// ARG is TRUE if confirm pressed, FALSE if cancel pressed
		response: deletePatient
	};

	async function deletePatient(confirmed) {
		if (confirmed) {
			let db = new DBAdapter();
			await db.delete('patients', ['patient_id', patient.patient_id]);
			patients.remove(patient.patient_id);
			goto('/dashboard/patients');
		}
	}
	export let patient;
	const homeUrl = () => {
		return `/dashboard/patients/${$page.params.patientId}`;
	};

	const udpatePopUp = {
		event: 'hover',
		target: 'udpatePopUp',
		placement: 'left'
	};
	// const archivePopUp = {
	// 	event: 'hover',
	// 	target: 'archivePopUp',
	// 	placement: 'right'
	// };
	const deletePopUp = {
		event: 'hover',
		target: 'deletePopUp',
		placement: 'bottom'
	};
</script>

<!--* Title and Actions -->
<section class="mb-2 flex items-center">
	<h1 class="text-xl font-medium text-surface-500 dark:text-surface-300">
		{patient.nom}
		{patient.prenom}
	</h1>
	<a
		href={homeUrl() + '/update'}
		class="mx-4 flex items-end justify-center"
		use:popup={udpatePopUp}>
		<UpdateIcon class="h-4 w-4 stroke-warning-800 dark:stroke-warning-300" />
	</a>
	<div data-popup="udpatePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">{$t('shared', 'update')}</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div>
	<!-- <button class="group flex items-end justify-center" use:popup={archivePopUp}>
		<ArchiveIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
	</button> -->
	<!-- <div data-popup="archivePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">Archiver</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div> -->
	<button
		class="group flex items-end justify-center"
		on:click={() => modalStore.trigger(modal)}
		use:popup={deletePopUp}>
		<DeleteIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
	</button>
	<div data-popup="deletePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">{$t('patients.detail', 'deleteModal.confirm')}</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div>
</section>
