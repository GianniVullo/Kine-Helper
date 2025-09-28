<script>
	import { t } from '$lib/i18n';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import { cloneDeep } from 'lodash';
	import {
		deleteFacture,
		getFacturePDF
	} from '../../../../../../../../lib/user-ops-handlers/documents';
	import CardTable from '../../../../../../../../lib/components/CardTable.svelte';
	import { CallBackModal } from '../../../../../../../../lib/cloud/libraries/overlays/CallbackModal.svelte';

	let { data } = $props();
	let factures = getContext('factures');

	let modal = new CallBackModal(
		{
			title: $t('shared', 'confirm'),
			description: $t('otherModal', 'facture.delete', {
				date: dayjs(page.state.modal?.facture.date).format('DD/MM/YYYY')
			})
		},
		async () => {
			let facture = page.state.modal?.facture;
			if (!facture) return;
			await deleteFacture(facture);
			console.log('Facture deleted', facture);
			factures.splice(factures.indexOf(facture), 1);
		}
	);
</script>

{#if data.sp.factures.length > 0}
	<CardTable>
		{#snippet header()}
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Date</th>
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">Type</th>
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">Total</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
				><span class="sr-only">Supprimer</span></th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
				><span class="sr-only">Ouvrir</span></th>
		{/snippet}
		{#snippet body()}
			{#each factures as facture}
				<tr>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
						{dayjs(facture.date ?? facture.created_at).format('DD/MM/YYYY')}
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
						{@html facture.type === 'patient'
							? $t('otherModal', 'facture.patient')
							: $t('otherModal', 'facture.mutuelle')}
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
						{facture.total.replace('.', ',')}€
					</td>
					<td
						class={{
							'relative py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0': true
						}}>
						<button
							onclick={(e) => {
								modal.modal = { ...modal.modal, facture: cloneDeep(facture) };
								modal.open(e);
							}}
							class="mr-4 text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400">
							Supprimer<span class="sr-only">, {data.patient.nom} {data.patient.prenom}</span>
						</button>
					</td>
					<td
						class={{
							'relative py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0': true
						}}>
						<button
							onclick={async (e) => {
								console.log('open facture');
								let { facture: f } = await getFacturePDF(facture);
								await f.open();
							}}
							class="mr-4 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
							Ouvrir<span class="sr-only">, {data.patient.nom} {data.patient.prenom}</span>
						</button>
					</td>
				</tr>
			{/each}
		{/snippet}
	</CardTable>
{:else}
	<p>Aucune facture trouvée.</p>
{/if}
