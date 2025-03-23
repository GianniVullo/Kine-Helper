<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { PlusIcon } from '$lib/ui/svgs/index';
	import dayjs from 'dayjs';
	import OpenIcon from '../../../../../../../lib/ui/svgs/OpenIcon.svelte';
	import DeleteIcon from '../../../../../../../lib/ui/svgs/DeleteIcon.svelte';
	import UpdateIcon from '../../../../../../../lib/ui/svgs/UpdateIcon.svelte';
	import { t } from '../../../../../../../lib/i18n';
	import { getContext } from 'svelte';
	import { deleteAccord, getAccordPDF } from '../../../../../../../lib/user-ops-handlers/documents';
	import { drawer } from '../../../../../../../lib/cloud/libraries/overlays/drawerUtilities.svelte';
	import AccordUpdateForm from '../../../../../../../lib/cloud/components/forms/documents/accords/AccordUpdateForm.svelte';

	let { data } = $props();
	let { patient, sp } = data;

	const modalStore = getModalStore();

	let accords = getContext('accords');
</script>

<div class="ml-2 flex flex-col space-y-4">
	<!--* Body -->
	<main class="flex flex-col flex-wrap">
		<div class="flex flex-col flex-wrap">
			<!--* Accord LIST -->
			<div class="flex flex-col">
				{#each accords as accord}
					<div
						class="flex flex-col justify-between rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100 dark:hover:bg-surface-700">
						<!--? Accord CONTROLS  -->
						<div class="mb-2 flex items-center space-x-4">
							<h5
								class="pointer-events-none select-none text-secondary-800 dark:text-secondary-200">
								Annexe {accord.metadata.doc} - {dayjs(accord.created_at).format('DD/MM/YYYY')}
							</h5>
							<div class="flex space-x-2">
								<button
									onclick={() => {
										console.log('accord in update button', accord);
										drawer.trigger({
											title: "Mettre à jour l'annexe",
											component: AccordUpdateForm,
											props: { patient, sp, mode: 'update', accord
											}
										});
									}}
									class="variant-outline-warning btn-icon btn-icon-sm"
									><UpdateIcon
										class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
								<button
									onclick={async () => {
										modalStore.trigger({
											title: $t('document.list', 'deleteModal.title'),
											body: $t('document.list', 'deleteModal.body'),
											buttonTextConfirm: $t('shared', 'confirm'),
											buttonTextCancel: $t('shared', 'cancel'),
											type: 'confirm',
											response: async (response) => {
												if (response) {
													await deleteAccord(accord);
													accords.splice(accords.indexOf(accord), 1);
												}
											}
										});
									}}
									class="variant-outline-error btn-icon btn-icon-sm"
									><DeleteIcon
										class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
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
						<div class="flex flex-col text-success-800 dark:text-surface-100"></div>
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
