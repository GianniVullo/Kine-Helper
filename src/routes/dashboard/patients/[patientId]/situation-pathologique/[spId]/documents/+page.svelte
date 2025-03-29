<script>
	import dayjs from 'dayjs';
	import OpenIcon from '../../../../../../../lib/ui/svgs/OpenIcon.svelte';
	import DeleteIcon from '../../../../../../../lib/ui/svgs/DeleteIcon.svelte';
	import UpdateIcon from '../../../../../../../lib/ui/svgs/UpdateIcon.svelte';
	import { t } from '../../../../../../../lib/i18n';
	import { getContext } from 'svelte';
	import { deleteAccord, getAccordPDF } from '../../../../../../../lib/user-ops-handlers/documents';
	import { drawer } from '../../../../../../../lib/cloud/libraries/overlays/drawerUtilities.svelte';
	import AccordUpdateForm from '../../../../../../../lib/cloud/components/forms/documents/accords/AccordUpdateForm.svelte';
	import Modal from '../../../../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { page } from '$app/state';
	import { openModal } from '../../../../../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { cloneDeep } from 'lodash';

	let { data } = $props();
	let { patient, sp } = data;

	let accords = getContext('accords');
</script>

<Modal
	opened={page.state?.modal?.name === 'deleteAccord'}
	title={$t('document.list', 'deleteModal.title')}
	body={$t('document.list', 'deleteModal.body')}
	buttonTextConfirm={$t('shared', 'confirm')}
	buttonTextCancel={$t('shared', 'cancel')}
	onAccepted={async () => {
		await deleteAccord(page.state.modal.accord);
		accords.splice(accords.indexOf(page.state.modal.accord), 1);
	}} />

<div class="ml-2 flex flex-col space-y-4">
	<!--* Body -->
	<main class="flex flex-col flex-wrap">
		<div class="flex flex-col flex-wrap">
			<!--* Accord LIST -->
			<div class="flex flex-col">
				{#each accords as accord}
					<div
						class="border-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 flex flex-col justify-between rounded-lg border px-4 py-2 shadow duration-200">
						<!--? Accord CONTROLS  -->
						<div class="mb-2 flex items-center space-x-4">
							<h5
								class="text-secondary-800 dark:text-secondary-200 pointer-events-none select-none">
								Annexe {accord.metadata.doc} - {dayjs(accord.created_at).format('DD/MM/YYYY')}
							</h5>
							<div class="flex space-x-2">
								<button
									onclick={() => {
										console.log('accord in update button', accord);
										drawer.trigger({
											title: "Mettre à jour l'annexe",
											component: AccordUpdateForm,
											props: { patient, sp, mode: 'update', accord }
										});
									}}
									class="variant-outline-warning btn-icon btn-icon-sm"
									><UpdateIcon
										class="stroke-surface-600 dark:stroke-surface-200 h-5 w-5" /></button>
								<button
									onclick={async () => {
										openModal({
											name: 'deleteAccord',
											accord: cloneDeep($state.snapshot(accord))
										});
									}}
									class="variant-outline-error btn-icon btn-icon-sm"
									><DeleteIcon
										class="stroke-surface-600 dark:stroke-surface-200 h-5 w-5" /></button>
								<button
									class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
									onclick={async () => {
										let { accord: annexe } = await getAccordPDF($state.snapshot(accord));
										console.log('annexe', annexe);
										await annexe.open();
									}}><OpenIcon class="h-5 w-5" /></button>
							</div>
						</div>
						<!--? Accord INFO -->
						<div class="text-success-800 dark:text-surface-100 flex flex-col"></div>
					</div>
				{:else}
					{$t('document.list', 'empty')}
				{/each}
			</div>
		</div>
		<!-- <div class="flex flex-col flex-wrap">
            * Testing LIST (à venir) 
            <div class="flex flex-col">Testings (à venir)</div>
		</div> -->
	</main>
</div>
