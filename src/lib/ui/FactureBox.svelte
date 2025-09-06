<script>
	import { OpenIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import dayjs from 'dayjs';
	import {
		deleteFacture,
		getFacturePDF,
		retrieveFactureAttestions
	} from '../user-ops-handlers/documents';
	import { t } from '../i18n';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import Modal from '../cloud/libraries/overlays/Modal.svelte';
	import { pushState } from '$app/navigation';

	let factures = getContext('factures');
	let { facture, patient, sp, className } = $props();
</script>

<Modal
	opened={page.state.modal === 'deleteFacture'}
	title={$t('shared', 'confirm')}
	body={$t('otherModal', 'facture.delete', {
		date: dayjs(facture.date).format('DD/MM/YYYY')
	})}
	onAccepted={async () => {
		await deleteFacture(facture);
		console.log('Facture deleted', facture);
		factures.splice(factures.indexOf(facture), 1);
		history.back();
	}} />
<div
	class="border-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 flex flex-col justify-between rounded-lg border px-4 py-2 shadow duration-200">
	<div class="flex items-center space-x-4 {className}">
		<h5 class="text-secondary-800 dark:text-secondary-200 pointer-events-none select-none">
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
					pushState('', { ...page.state, modal: 'deleteFacture' });
				}}
				class="variant-outline-error btn-icon btn-icon-sm"
				><DeleteIcon class="stroke-surface-600 dark:stroke-surface-200 h-5 w-5" /></button>
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
	<div class="text-surface-800 dark:text-surface-100 flex flex-col">
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
