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

	const modalStore = getModalStore();
	const modal = {
		type: 'confirm',
		// Data
		title: 'Confirmation requise',
		body: 'Êtes-vous sûr de vouloir <span class="text-error-500 font-medium">supprimer</span> ce patient ?<br>Attention cette action est <span class="font-medium">irréversible</span>.',
		buttonTextConfirm: 'Confirmer',
		buttonTextCancel: 'Annuler',
		modalClasses: {
			buttonPositive: 'isModal'
		},
		// buttonPositive: 'isModal',
		// ARG is TRUE if confirm pressed, FALSE if cancel pressed
		response: deletePatient
	};

	async function deletePatient(confirmed) {
		if (confirmed) {
			console.log('Pressed confirm');
			let { data, error } = await supabase
				.from('patients')
				.delete()
				.eq('patient_id', patient.patient_id);
			console.log('supabase response', data, error);
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
	const archivePopUp = {
		event: 'hover',
		target: 'archivePopUp',
		placement: 'right'
	};
	const deletePopUp = {
		event: 'hover',
		target: 'deletePopUp',
		placement: 'bottom'
	};

	const moreInfoPopup = {
		event: 'click',
		target: 'popupFeatured',
		placement: 'right'
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
			<p class="text-xs">Modifier</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div>
	<button class="group flex items-end justify-center" use:popup={archivePopUp}>
		<ArchiveIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
	</button>
	<div data-popup="archivePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">Archiver</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div>
	<button
		class="group mx-4 flex items-end justify-center"
		on:click={() => modalStore.trigger(modal)}
		use:popup={deletePopUp}>
		<DeleteIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
	</button>
	<div data-popup="deletePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">Supprimer</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div>
	<!--* Patient info -->
	<button class="group" use:popup={moreInfoPopup}>
		<InfoIcon
			class="h-4 w-4 stroke-secondary-600 group-hover:stroke-secondary-700 dark:stroke-secondary-300" />
		<div class="card ml-4 w-72 p-4 shadow-xl" data-popup="popupFeatured">
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				📍 {patient.adresse}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				📮 {patient.cp}
				{patient.localite}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300"></p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				📆 {patient.date_naissance}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				Sexe : {patient.sexe}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				NISS : {patient.niss}
			</p>
			{#if patient.email}
				<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
					📧 {patient.email}
				</p>
			{/if}
			{#if patient.gsm}
				<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
					📱 {patient.gsm}
				</p>
			{/if}
			{#if patient.tel}
				<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
					☎️ {patient.telephone}
				</p>
			{/if}
			<div class="bg-surface-100-800-token arrow" />
		</div>
	</button>
</section>
