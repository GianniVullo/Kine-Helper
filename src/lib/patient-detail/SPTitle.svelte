<script>
	import { page } from '$app/stores';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { deleteSituationPathologique } from '../user-ops-handlers/situations_pathologiques';
	import PageTitle from '../components/PageTitle.svelte';
	import BoutonPrincipalAvecIcone from '../components/BoutonPrincipalAvecIcone.svelte';
	import BoutonSecondaireAvecIcone from '../components/BoutonSecondaireAvecIcone.svelte';
	import Dropdown from '../components/Dropdown.svelte';
	import { dropdownItem } from '../components/DropdownItem.svelte';

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
				await deleteSituationPathologique({
					sp_id: $page.params.spId,
					patient_id: $page.params.patientId
				});
				goto('/dashboard/patients/' + $page.params.patientId);
			}
		}
	};
	const documentSelectionModal = {
		type: 'component',
		component: 'documentSelection'
	};
	let { patient, currentSp } = $props();
</script>

<PageTitle srOnly="Résumé de la situation pathologique">
	{#snippet title()}
		<div class="sm:flex sm:space-x-5">
			<div class="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
				<p class="truncate text-xl font-bold text-gray-900">
					{currentSp?.motif?.split(' ')?.slice(0, 3).join(' ')}
					{currentSp?.motif?.split(' ')?.length > 3 ? '...' : ''}
				</p>
				<p class="text-sm font-medium text-gray-600">{patient?.nom} {patient?.nom}</p>
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<div class="mt-5 flex justify-center sm:justify-start lg:ml-4 lg:mt-0">
			<span class="hidden sm:block">
				<BoutonSecondaireAvecIcone
					href={`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/update`}
					inner="Modifier">
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
				<BoutonSecondaireAvecIcone
					href={`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/details`}
					inner="Détails">
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
				<BoutonSecondaireAvecIcone onclick={() => modalStore.trigger(modal)} inner="Supprimer">
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
					{@render dropdownItem(
						`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/update`,
						null,
						'Modifier'
					)}
					{@render dropdownItem(
						`/dashboard/patients/${$page.params.patientId}/situation-pathologique/${$page.params.spId}/details`,
						null,
						'Détails'
					)}
					{@render dropdownItem(undefined, () => modalStore.trigger(modal), 'Supprimer')}
				{/snippet}
			</Dropdown>
		</div>
	{/snippet}
</PageTitle>
