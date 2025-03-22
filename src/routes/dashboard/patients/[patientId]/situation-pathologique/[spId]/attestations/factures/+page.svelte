<script>
	import FactureBox from '../../../../../../../../lib/ui/FactureBox.svelte';
	import { t } from '$lib/i18n';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

	let { data } = $props();
	let factures = getContext('factures');

	let { patient, sp } = data;
</script>

<!-- TODO Devrais-je rajouter que l'attestation porte la prescription ?  -->

{#if sp.factures.length > 0}
	<!--* Factures LIST -->
	<div class="flex space-x-2">
		<div class="flex flex-col space-y-2">
			{#each factures as facture}
				<FactureBox {facture} {patient} {sp} />
			{:else}
				<p class="">Pas de factures</p>
			{/each}
		</div>
	</div>
{:else}
	<p>{$t('attestation.list', 'empty')}</p>
{/if}
