<script>
	import { page } from '$app/state';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { deleteSituationPathologique } from '../user-ops-handlers/situations_pathologiques';
	import PageTitle from '../components/PageTitle.svelte';
	import BoutonPrincipalAvecIcone from '../components/BoutonPrincipalAvecIcone.svelte';
	import BoutonSecondaireAvecIcone from '../components/BoutonSecondaireAvecIcone.svelte';
	import Dropdown from '../components/dropdowns/Dropdown.svelte';
	import {
		dividerDropper,
		dropdownItem,
		dropdownItemWithIcon
	} from '../components/dropdowns/DropdownSnippets.svelte';
	import {
		editIcon,
		linkIcon,
		deleteIcon,
		euroIcon,
		pagePlusIcon,
		calendarIcon
	} from '../ui/svgs/IconSnippets.svelte';
	import dayjs from 'dayjs';

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
					sp_id: page.params.spId,
					patient_id: page.params.patientId
				});
				goto('/dashboard/patients/' + page.params.patientId);
			}
		}
	};
	const documentSelectionModal = {
		type: 'component',
		component: 'documentSelection'
	};
	let { patient, currentSp } = $props();
	let items = [
		{
			name: get(t)('patients.detail', 'attestation'),
			href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}/attestations/create`,
			condition:
				currentSp?.seances.filter((seance) => {
					return (
						dayjs(dayjs(seance.date).format('YYYY-MM-DD')).isBefore(dayjs()) &&
						!seance.attestation_id
					);
				}).length > 0,
			icon: euroIcon
		},
		{
			name: get(t)('patients.detail', 'prescription'),
			href:
				`/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}` +
				'/prescriptions/create',
			condition: true,
			icon: pagePlusIcon
		},
		{
			name: get(t)('patients.detail', 'prestations'),
			href:
				`/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}` +
				'/generateurs/create',
			condition: true,
			icon: calendarIcon
		}
	];
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
			<Dropdown inner="Actions" className="ml-3">
				{#snippet dropper(menuItems, menuState)}
					{@render dividerDropper(menuItems, menuState)}
				{/snippet}
				{#snippet menuItems()}
					<div class="py-1">
						{#each items as { href, name, condition, icon }}
							{#if condition}
								{@render dropdownItemWithIcon(href, null, name, icon)}
							{/if}
						{/each}
					</div>
					{@render dropdownItemWithIcon(
						`/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/details`,
						null,
						'Détails',
						linkIcon
					)}
					<div class="py-1" role="none">
						{@render dropdownItemWithIcon(
							`/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/update`,
							null,
							'Modifier',
							editIcon
						)}
						{@render dropdownItemWithIcon(
							undefined,
							() => modalStore.trigger(modal),
							'Supprimer',
							deleteIcon
						)}
					</div>
				{/snippet}
			</Dropdown>

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
		</div>
	{/snippet}
</PageTitle>
