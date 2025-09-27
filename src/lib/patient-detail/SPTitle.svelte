<script>
	import { page } from '$app/state';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import PageTitle from '../components/PageTitle.svelte';
	import BoutonPrincipalAvecIcone from '../components/BoutonPrincipalAvecIcone.svelte';
	import { editIcon, linkIcon, deleteIcon } from '../ui/svgs/IconSnippets.svelte';
	import { invalidate } from '$app/navigation';
	import { appState } from '../managers/AppState.svelte';
	import TwDropdown from '../components/TWElements/TWDropdown.svelte';
	import { CallBackModal } from '../cloud/libraries/overlays/CallbackModal.svelte.js';

	let { patient, currentSp } = $props();
	let modal = new CallBackModal(
		{
			title: get(t)('patients.detail', 'deleteModal.title'),
			description: get(t)('patients.detail', 'deleteModal.body'),
			href: `/dashboard/patients/${page.params.patientId}`
		},
		async (e) => {
			e.preventDefault();
			await appState.db.delete('situations_pathologiques', [['sp_id', page.params.spId]]);
			await invalidate('patient:layout');
		}
	);

	let items = [
		[
			{
				href: `/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/details`,
				icon: linkIcon,
				label: 'Détails'
			},
			{
				href: `/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/update`,
				icon: editIcon,
				label: 'Modifier'
			},
			{
				label: 'Supprimer',
				icon: deleteIcon,
				onclick: modal.open.bind(modal)
			}
		]
	];
</script>

<PageTitle srOnly="Résumé de la situation pathologique">
	{#snippet title()}
		<div class="sm:flex sm:space-x-5">
			<div class="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
				<p class="truncate text-xl font-bold text-gray-900 dark:text-white">
					{currentSp?.motif?.split(' ')?.slice(0, 3).join(' ')}
					{currentSp?.motif?.split(' ')?.length > 3 ? '...' : ''}
				</p>
				<p class="text-sm font-medium text-gray-600 dark:text-gray-400">
					{patient?.nom}
					{patient?.prenom}
				</p>
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<div class="mt-5 flex justify-center sm:justify-start lg:mt-0 lg:ml-4">
			<TwDropdown triggerText="Actions" {items} />

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
