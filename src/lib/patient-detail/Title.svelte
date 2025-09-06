<script>
	import { page } from '$app/state';
	import { dropdownItem } from '../components/dropdowns/DropdownSnippets.svelte';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { deletePatient } from '../../lib/user-ops-handlers/patients';
	import PageTitle from '../components/PageTitle.svelte';
	import BoutonSecondaireAvecIcone from '../components/BoutonSecondaireAvecIcone.svelte';
	import BoutonPrincipalAvecIcone from '../components/BoutonPrincipalAvecIcone.svelte';
	import Dropdown from '../components/dropdowns/Dropdown.svelte';
	import Modal from '../cloud/libraries/overlays/Modal.svelte';
	import { pushState, goto } from '$app/navigation';
	import { archiveBoxArrowDownIcon, eyeIcon } from '../ui/svgs/IconSnippets.svelte';
	import { supabase } from '../stores/supabaseClient';
	import { appState } from '../managers/AppState.svelte';

	const modal = {
		title: get(t)('patients.detail', 'pdeleteModal.title'),
		body: get(t)('patients.detail', 'pdeleteModal.body'),
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel')
	};

	let { patient } = $props();
	const homeUrl = () => {
		return `/dashboard/patients/${page.params.patientId}`;
	};
</script>

<Modal
	opened={page.state.modal === 'patientDeleteModal'}
	{...modal}
	onAccepted={async () => {
		const { error } = await appState.db.delete('patients', [['patient_id', patient.patient_id]]);
		goto('/dashboard/patients');
	}} />
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
				{#if patient.mutualite}
					<p class="text-sm font-medium text-gray-600">Mutualité : {patient.mutualite}</p>
				{/if}
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<div class="mt-5 flex justify-center sm:justify-start lg:mt-0 lg:ml-4">
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
				<BoutonSecondaireAvecIcone
					inner="Archiver"
					onclick={() => {
						console.log('ARCHIVE TO BE DONE');
						/**
						 * TODO */
					}}>
					{#snippet icon(cls)}
						{@render archiveBoxArrowDownIcon(cls)}
					{/snippet}
				</BoutonSecondaireAvecIcone>
			</span>

			<span class="ml-3 hidden sm:block">
				<BoutonSecondaireAvecIcone
					onclick={() => pushState('', { ...page.state, modal: 'patientDeleteModal' })}
					inner="Supprimer">
					{#snippet icon(cls)}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="mr-1.5 -ml-0.5 size-5 text-red-400">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					{/snippet}
				</BoutonSecondaireAvecIcone>
			</span>

			<span class="sm:ml-3">
				<BoutonPrincipalAvecIcone href={homeUrl() + '/details'} inner="Appeler">
					{#snippet icon(cls)}
						{@render eyeIcon(cls)}
					{/snippet}
				</BoutonPrincipalAvecIcone>
			</span>

			<Dropdown inner="Actions">
				{#snippet menuItems()}
					{@render dropdownItem(homeUrl() + '/update', null, 'Modifier')}
					{@render dropdownItem(homeUrl() + '/details', null, 'Détails')}
					{@render dropdownItem(
						undefined,
						() => pushState('', { ...page.state, modal: 'patientDeleteModal' }),
						'Supprimer'
					)}
				{/snippet}
			</Dropdown>
		</div>
	{/snippet}
</PageTitle>
