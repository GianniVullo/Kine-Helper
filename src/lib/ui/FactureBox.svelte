<script>
	import { OpenIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import dayjs from 'dayjs';
	import {
		deleteFacture,
		getFacturePDF,
		retrieveFactureAttestions
	} from '../user-ops-handlers/documents';
	import { t } from '../i18n';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

	let factures = getContext('factures');
	console.log('factures in FactureBox', factures);
	let { facture, patient, sp, className } = $props();
</script>

<div
	class="flex flex-col justify-between rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100 dark:hover:bg-surface-800/50">
	<div class="flex items-center space-x-4 {className}">
		<h5 class="pointer-events-none select-none text-secondary-800 dark:text-secondary-200">
			{@html $t('otherModal', 'facture.title', {
				type:
					facture.type === 'patient'
						? $t('otherModal', 'facture.patient')
						: $t('otherModal', 'facture.mutuelle'),
				date: dayjs(facture.created_at).format('DD/MM/YYYY')
			})}
		</h5>
		<!--? FACTURE CONTROLS  -->
		<div class="flex space-x-2">
			<!--! ne pas permmettre de modifier une facture
        <button class="variant-outline-warning btn-icon btn-icon-sm"
            ><UpdateIcon
                class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button> -->
			<button
				onclick={async () => {
					modalStore.trigger({
						title: $t('shared', 'confirm'),
						body: $t('otherModal', 'facture.delete', {
							date: dayjs(facture.date).format('DD/MM/YYYY')
						}),
						type: 'confirm',
						response: async (response) => {
							if (response) {
								await deleteFacture(facture);
								factures.splice(factures.indexOf(facture), 1);
							}
						}
					});
				}}
				class="variant-outline-error btn-icon btn-icon-sm"
				><DeleteIcon class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
			<button
				onclick={async () => {
					console.log('open facture');
					let { facture: f } = await getFacturePDF(facture);
					await f.open();
				}}
				class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
				><OpenIcon class="h-5 w-5" /></button>
		</div>
	</div>
	<div class="flex flex-col text-surface-800 dark:text-surface-100">
		<h5 class="">
			<span class="text-surface-400">{$t('sp.detail', 'attestations')} :</span>
		</h5>
		<ul class="mb-4 h-12 overflow-y-scroll">
			{#await new Promise(async (resolve, reject) => {
				console.log('facture', facture);
				const { data, error } = await retrieveFactureAttestions(facture);
				if (error) {
					reject(error);
				} else {
					console.log('data', data);
					resolve(data);
				}
			}) then attestations}
				{#each attestations as att}
					<li>
						&nbsp;&nbsp;&nbsp;&nbsp;
						{dayjs(att?.date).format('DD/MM/YYYY') +
							` - ${
								sp.seances.filter((s) => s.attestation_id === att.attestation_id).length
							} prestations,`}
					</li>
				{/each}
			{:catch error}
				Cannot find attestations linked to this facture
			{/await}
		</ul>
		<h5>
			<span class="text-surface-400">{$t('otherModal', 'total')}:</span>
			{facture.total}€
		</h5>
	</div>
</div>
