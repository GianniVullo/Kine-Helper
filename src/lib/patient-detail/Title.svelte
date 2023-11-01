<script>
	import UpdateIcon from '$lib/ui/svgs/UpdateIcon.svelte';
	import DeleteIcon from '$lib/ui/svgs/DeleteIcon.svelte';
	import InfoIcon from '$lib/ui/svgs/InfoIcon.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import ArchiveIcon from '$lib/ui/svgs/ArchiveIcon.svelte';

	export let data;
    export let homeUrl;

	const udpatePopUp = {
		event: 'hover',
		target: 'udpatePopUp',
		placement: 'bottom'
	};
	const archivePopUp = {
		event: 'hover',
		target: 'archivePopUp',
		placement: 'bottom'
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
	<h1 class="text-xl font-medium text-surface-500 dark:text-surface-300">{data.nom} {data.prenom}</h1>
	<a
		href={homeUrl + '/update'}
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
	<button class="group mx-4 flex items-end justify-center" use:popup={deletePopUp}>
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
		<InfoIcon class="h-4 w-4 stroke-secondary-600 group-hover:stroke-secondary-700 dark:stroke-secondary-300" />
		<div class="card ml-4 w-72 p-4 shadow-xl" data-popup="popupFeatured">
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				📍 {data.adresse}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				📮 {data.cp}
				{data.localite}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300"></p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				📆 {data.date_naissance}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				Sexe : {data.sexe}
			</p>
			<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
				NISS : {data.niss}
			</p>
			{#if data.email}
				<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
					📧 {data.email}
				</p>
			{/if}
			{#if data.gsm}
				<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
					📱 {data.gsm}
				</p>
			{/if}
			{#if data.tel}
				<p class="mb-1 text-sm text-surface-700 dark:text-surface-300">
					☎️ {data.telephone}
				</p>
			{/if}
			<div class="bg-surface-100-800-token arrow" />
		</div>
	</button>
</section>
