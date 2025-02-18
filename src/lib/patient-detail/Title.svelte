<script>
	import { page } from '$app/state';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { dropdownItem } from '../components/dropdowns/DropdownSnippets.svelte';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { deletePatient } from '../../lib/user-ops-handlers/patients';
	import PageTitle from '../components/PageTitle.svelte';
	import BoutonSecondaireAvecIcone from '../components/BoutonSecondaireAvecIcone.svelte';
	import BoutonPrincipalAvecIcone from '../components/BoutonPrincipalAvecIcone.svelte';
	import Dropdown from '../components/dropdowns/Dropdown.svelte';

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
				const { error } = await deletePatient(patient);
				if (error) {
					modalStore.trigger({
						type: 'alert',
						title: 'ERROR',
						body: error
					});
				}
			}
		}
	});

	let { patient } = $props();
	const homeUrl = () => {
		return `/dashboard/patients/${page.params.patientId}`;
	};
</script>

<PageTitle srOnly="Résumé du patient">
	{#snippet title()}
		<div class="sm:flex sm:space-x-5">
			<div class="shrink-0">
				{#if patient.image}
					<img class="mx-auto size-20 rounded-full" src={patient.image} alt="" />
				{:else}
					<div
						class="mx-auto flex size-20 items-center justify-center rounded-full bg-gray-400 text-center text-xl font-extrabold text-gray-600">
						{patient.nom[0]}
						{patient?.prenom?.[0]}
					</div>
				{/if}
			</div>
			<div class="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
				<p class="text-xl font-bold text-gray-900 sm:text-2xl">
					{patient?.nom}
					{patient?.prenom}
				</p>
				<p class="text-sm font-medium text-gray-600">Mutualité</p>
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<div class="mt-5 flex justify-center sm:justify-start lg:ml-4 lg:mt-0">
			<span class="hidden sm:block">
				<BoutonSecondaireAvecIcone href={homeUrl() + '/update'} inner="Modifier">
					{#snippet icon(cls)}
						<svg
							class={cls}
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
						</svg>
					{/snippet}
				</BoutonSecondaireAvecIcone>
			</span>

			<span class="ml-3 hidden sm:block">
				<BoutonSecondaireAvecIcone href={homeUrl() + '/details'} inner="Détails">
					{#snippet icon(cls)}
						<svg
							class={cls}
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
							<path
								d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
						</svg>
					{/snippet}
				</BoutonSecondaireAvecIcone>
			</span>

			<span class="ml-3 hidden sm:block">
				<BoutonSecondaireAvecIcone onclick={() => modalStore.trigger(modal())} inner="Supprimer">
					{#snippet icon(cls)}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="-ml-0.5 mr-1.5 size-5 text-red-400">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					{/snippet}
				</BoutonSecondaireAvecIcone>
			</span>

			<span class="sm:ml-3">
				<BoutonPrincipalAvecIcone
					inner="Archiver"
					onclick={() => {
						console.log('ARCHIVE TO BE DONE');
						/**
						 * TODO */
					}}>
					{#snippet icon(cls)}
						<svg
							class={cls}
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								fill-rule="evenodd"
								d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
								clip-rule="evenodd" />
						</svg>
					{/snippet}
				</BoutonPrincipalAvecIcone>
			</span>

			<Dropdown inner="Actions">
				{#snippet menuItems()}
					{@render dropdownItem(homeUrl() + '/update', null, 'Modifier')}
					{@render dropdownItem(homeUrl() + '/details', null, 'Détails')}
					{@render dropdownItem(undefined, () => modalStore.trigger(modal()), 'Supprimer')}
				{/snippet}
			</Dropdown>
		</div>
	{/snippet}
</PageTitle>
