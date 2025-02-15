<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { PlusIcon, PrinterIcon, UpdateIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import { patients } from '$lib/stores/PatientStore';
	import { printAttestation } from '$lib/utils/rawPrinting';
	import { fetchCodeDesSeances } from '$lib/utils/nomenclatureManager';
	import FactureBox from '../../../../../../../../lib/ui/FactureBox.svelte';
	import { t } from '$lib/i18n';
	import { updateAttestation } from '$lib/user-ops-handlers/attestations';

	let { data } = $props();

	let { patient, sp } = data;
</script>

<!-- TODO Devrais-je rajouter que l'attestation porte la prescription ?  -->

{#if sp.documents.length > 0}
	<!--* Factures LIST -->
		<div class="flex space-x-2">
			<div class="flex flex-col space-y-2">
				{#each sp
					.documents.filter((d) => [8, 9].includes(d.docType)) as facture}
					<FactureBox {facture} {patient} {sp} />
				{/each}
			</div>
		</div>
{:else}
	<p>{$t('attestation.list', 'empty')}</p>
{/if}
