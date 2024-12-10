<script>
	import { page } from '$app/stores';
	// import UpdateIcon from '$lib/ui/svgs/UpdateIcon.svelte';
	// import DeleteIcon from '$lib/ui/svgs/DeleteIcon.svelte';
	// import { popup } from '@skeletonlabs/skeleton';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore();
	const modal = () => ({
		type: 'confirm',
		title: get(t)('patients.detail', 'pdeleteModal.title'),
		body: get(t)('patients.detail', 'pdeleteModal.body'),
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel'),
		modalClasses: {
			buttonPositive: 'isModal'
		},
		response: async (r) => {
			if (r) {
				await deletePatient(data);
			}
		}
	});

	let { patient, currentSp } = $props();
	const homeUrl = () => {
		return `/dashboard/patients/${$page.params.patientId}`;
	};

	// const udpatePopUp = {
	// 	event: 'hover',
	// 	target: 'udpatePopUp',
	// 	placement: 'left'
	// };
	// const archivePopUp = {
	// 	event: 'hover',
	// 	target: 'archivePopUp',
	// 	placement: 'right'
	// };
	// const deletePopUp = {
	// 	event: 'hover',
	// 	target: 'deletePopUp',
	// 	placement: 'bottom'
	// };

	let menuState = $state(false);
</script>

<div class="max-w-sm rounded-lg bg-white">
	<h2 class="sr-only" id="profile-overview-title">Résumé du patient</h2>
	<div class="bg-white p-6">
		<div class="sm:flex sm:items-center sm:justify-between">
			<div class="sm:flex sm:space-x-5">
				<div class="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
					<p
						class="truncate text-xl font-bold text-gray-900">
						{currentSp?.motif}
					</p>
					<p class="text-sm font-medium text-gray-600">{patient?.nom} {patient?.nom}</p>
				</div>
			</div>
			<div class="mt-5 flex justify-center sm:justify-start lg:ml-4 lg:mt-0">
				<!-- <span class="hidden sm:block">
					<a
						href={homeUrl() + '/update'}
						type="button"
						class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						<svg
							class="-ml-0.5 mr-1.5 size-5 text-gray-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
						</svg>
						Modifier
					</a>
				</span> -->

				<!-- <span class="ml-3 hidden sm:block">
					<button
						type="button"
						class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						<svg
							class="-ml-0.5 mr-1.5 size-5 text-gray-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
							<path
								d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
						</svg>
						Détails
					</button>
				</span> -->

				<!-- <span class="ml-3 hidden sm:block">
					<button
						onclick={() => modalStore.trigger(modal())}
						type="button"
						class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="-ml-0.5 mr-1.5 size-5 text-red-400">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>

						Supprimer
					</button>
				</span> -->

				<span class="sm:ml-3">
					<button
						type="button"
						class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
						<svg
							class="-ml-0.5 mr-1.5 size-5"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								fill-rule="evenodd"
								d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
								clip-rule="evenodd" />
						</svg>
						Archiver
					</button>
				</span>

				<!-- Dropdown -->
				<div class="relative ml-3">
					<button
						type="button"
						onclick={() => {
							menuState = !menuState;
						}}
						class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
						id="mobile-menu-button"
						aria-expanded="false"
						aria-haspopup="true">
						Actions
						<svg
							class="-mr-1 ml-1.5 size-5 text-gray-400"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								fill-rule="evenodd"
								d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd" />
						</svg>
					</button>

					<!--
				Dropdown menu, show/hide based on menu state.
		
				Entering: "transition ease-out duration-200"
				  From: "transform opacity-0 scale-95"
				  To: "transform opacity-100 scale-100"
				Leaving: "transition ease-in duration-75"
				  From: "transform opacity-100 scale-100"
				  To: "transform opacity-0 scale-95"
			  -->
					<div
						class="absolute right-0 z-50 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition duration-200 focus:outline-none {menuState
							? 'scale-100 opacity-100 ease-out'
							: 'scale-95 opacity-0 ease-in'}"
						role="menu"
						aria-orientation="vertical"
						aria-labelledby="mobile-menu-button"
						tabindex="-1">
						<!-- Active: "bg-gray-100 outline-none", Not Active: "" -->
						<a
							href={homeUrl() + '/update'}
							class="block px-4 py-2 text-sm text-gray-700"
							role="menuitem"
							tabindex="-1"
							id="mobile-menu-item-0">Modifier</a>
						<a
							href="#"
							class="block px-4 py-2 text-sm text-gray-700"
							role="menuitem"
							tabindex="-1"
							id="mobile-menu-item-1">Détails</a>
						<button
							onclick={() => modalStore.trigger(modal())}
							class="block px-4 py-2 text-sm text-gray-700"
							role="menuitem"
							tabindex="-1"
							id="mobile-menu-item-1">Supprimer</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	{#if patient.tel || patient.email || patient.gsm}
		<div
			class="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
			{#if patient.tel}
				<div
					class="flex items-center justify-center space-x-2 px-6 py-5 text-center text-sm font-medium">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-6 fill-green-500">
						<path
							fill-rule="evenodd"
							d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
							clip-rule="evenodd" />
					</svg>

					<span class="text-gray-600">{patient.tel}</span>
				</div>
			{/if}
			{#if patient.email}
				<div class="px-6 py-5 text-center text-sm font-medium">
					<span class="text-gray-900">4</span>
					<span class="text-gray-600">{patient.email}</span>
				</div>
			{/if}{#if patient.gsm}
				<div class="px-6 py-5 text-center text-sm font-medium">
					<span class="text-gray-900">2</span>
					<span class="text-gray-600">{patient.gsm}</span>
				</div>
			{/if}
		</div>
		<!-- {:else}
		<div
			class="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
			<div
				class="flex items-center justify-center space-x-2 px-6 py-5 text-center text-sm font-medium">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6 fill-red-50 stroke-red-600">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
				</svg>

				<span class="text-gray-600">Pas de données de contact</span>
			</div>
		</div> -->
	{/if}
</div>

<!--* Title and Actions -->
<!-- <section class="mb-2 flex items-center">
	<h1 class="text-xl font-medium text-surface-500 dark:text-surface-300">
		{patient?.nom}
		{patient?.prenom}
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
	</div> -->
<!-- <button class="group flex items-end justify-center" use:popup={archivePopUp}>
		<ArchiveIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
	</button> -->
<!-- <div data-popup="archivePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">Archiver</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div> -->
<!-- <button
		class="group flex items-end justify-center"
		onclick={() => modalStore.trigger(modal())}
		use:popup={deletePopUp}>
		<DeleteIcon class="h-4 w-4 stroke-error-800 dark:stroke-error-300" />
	</button>
	<div data-popup="deletePopUp">
		<div class="card variant-filled-surface p-2">
			<p class="text-xs">{$t('patients.detail', 'deleteModal.confirm')}</p>
			<div class="variant-filled-surface arrow" />
		</div>
	</div>
</section> -->
