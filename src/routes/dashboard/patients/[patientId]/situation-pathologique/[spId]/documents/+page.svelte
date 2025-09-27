<script>
	import dayjs from 'dayjs';
	import { t } from '../../../../../../../lib/i18n';
	import { getContext } from 'svelte';
	import { deleteAccord, getAccordPDF } from '../../../../../../../lib/user-ops-handlers/documents';
	import AccordUpdateForm from '../../../../../../../lib/components/forms/AccordUpdateForm.svelte';
	import { page } from '$app/state';
	import { cloneDeep } from 'lodash';
	import Drawer from '../../../../../../../lib/cloud/libraries/overlays/Drawer.svelte';
	import CardTable from '../../../../../../../lib/components/CardTable.svelte';
	import { openDrawer } from '../../../../../../../lib/cloud/libraries/overlays/drawerUtilities.svelte';
	import { appState } from '../../../../../../../lib/managers/AppState.svelte';
	import { CallBackModal } from '../../../../../../../lib/cloud/libraries/overlays/CallbackModal.svelte';

	let { data } = $props();
	let { patient, sp } = data;

	let accords = getContext('accords');
	let modal = new CallBackModal(
		{
			title: $t('document.list', 'deleteModal.title'),
			description: $t('document.list', 'deleteModal.body')
		},
		async (e) => {
			console.log('in cbmodal delateAccord', e);
			await appState.db.delete('accords', [['id', e.detail.accord_id]]);
			let delIdx = accords.findIndex((a) => a.id === e.detail.accord_id);
			accords.splice(delIdx, 1);
		}
	);
</script>

<Drawer
	opened={page.state.drawer?.name === 'accordUpdate'}
	title="Mettre à jour l'annexe"
	description="Panel de contrôle de votre annexe.">
	<AccordUpdateForm {patient} {sp} mode="update" accord={page.state.drawer?.accord} />
</Drawer>

<div class="ml-2 flex flex-col space-y-4">
	<!--* Body -->
	<main class="flex flex-col flex-wrap">
		<div class="flex flex-col flex-wrap">
			<!--* Accord LIST -->
			<div class="flex flex-col">
				{#if accords.length > 0}
					<CardTable>
						{#snippet header()}
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">ID</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Date</th>
							<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0"
								>Accord</th>
							<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0"
								>Validité</th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
								><span class="sr-only">Supprimer</span></th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
								><span class="sr-only">Modifier</span></th>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
								><span class="sr-only">Ouvrir</span></th>
						{/snippet}
						{#snippet body()}
							{#each accords as accord}
								<tr>
									<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
										{accord.id}
									</td>
									<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
										{dayjs(accord.date).format('DD/MM/YYYY')}
									</td>
									<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
										{accord.metadata.doc}
									</td>
									<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
										{#if accord.valid_from}
											{accord.valid_from} ->
										{:else}
											Période de validité non mentionnée
										{/if}
										{#if accord.valid_from && accord.valid_to}
											{accord.valid_to}
										{/if}
									</td>
									<td
										class="relative py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0">
										<button
											onclick={(e) => {
												modal.modal.accord_id = accord.id;
												modal.open(e);
											}}
											class="mr-4 text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400">
											Supprimer<span class="sr-only">, {patient.nom} {patient.prenom}</span>
										</button>
									</td>
									<td
										class="relative cursor-pointer py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
										<button
											onclick={async () => {
												console.log('accord in update button', accord);
												openDrawer({
													name: 'accordUpdate',
													accordId: accord.id,
													accord: cloneDeep($state.snapshot(accord))
												});
											}}
											class="mr-4 text-yellow-600 hover:text-yellow-900 dark:text-yellow-500 dark:hover:text-yellow-400"
											>Modifier</button>
									</td>

									<td
										class="relative py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0">
										<button
											onclick={async () => {
												let { accord: annexe } = await getAccordPDF($state.snapshot(accord));
												console.log('annexe', annexe);
												await annexe.open();
											}}
											class="mr-4 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
											Ouvrir<span class="sr-only">, {patient.nom} {patient.prenom}</span>
										</button>
									</td>
								</tr>
							{/each}
						{/snippet}
					</CardTable>
				{:else}
					<p class="my-5">{$t('document.list', 'empty')}</p>
				{/if}
			</div>
		</div>
		<!-- <div class="flex flex-col flex-wrap">
            * Testing LIST (à venir) 
            <div class="flex flex-col">Testings (à venir)</div>
		</div> -->
	</main>
</div>
