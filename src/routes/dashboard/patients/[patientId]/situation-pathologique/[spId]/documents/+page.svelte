<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { PlusIcon } from '$lib/ui/svgs/index';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import OpenIcon from '../../../../../../../lib/ui/svgs/OpenIcon.svelte';
	import DeleteIcon from '../../../../../../../lib/ui/svgs/DeleteIcon.svelte';
	import UpdateIcon from '../../../../../../../lib/ui/svgs/UpdateIcon.svelte';
	import { AnnexeA } from '../../../../../../../lib/pdfs/annexeA';
	import { AnnexeB } from '../../../../../../../lib/pdfs/annexeB';
	import { t } from '../../../../../../../lib/i18n';

	const modalStore = getModalStore();
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);

	const documentSelectionModal = {
		type: 'component',
		component: 'documentSelection'
	};

	function instantiateAccord(accord) {
		if (accord.docType === 0) {
			return new AnnexeA(accord.form_data, patient, sp, accord);
		}
		if (accord.docType === 1) {
			return new AnnexeB(accord.form_data, patient, sp, accord);
		}
	}
</script>

<div class="ml-2 flex flex-col space-y-4">
	<!--* Header -->
	<header class="flex flex-col">
		<h5 class="text-lg text-surface-500 dark:text-surface-400">
			{$t('document.list', 'title', { date: dayjs(sp.created_at).format('DD/MM/YYYY') })}
		</h5>
		<div class="flex space-x-2">
			<button
				on:click={() => modalStore.trigger(documentSelectionModal)}
				class="variant-outline-secondary btn btn-sm my-2 flex">
				<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
				<span class="text-sm text-surface-500 dark:text-surface-400">{$t('document.list', 'accord')}</span></button>
		</div>
	</header>
	<!--* Body -->
	<main class="flex flex-col flex-wrap">
		<div class="flex flex-col flex-wrap">
			<!--* Accord LIST -->
			{#if sp.documents.filter((d) => [0, 1].includes(d.docType)).length > 0}
				<div class="flex flex-col">
					<h5 class="text-lg text-surface-500 dark:text-surface-400">
						{$t('document.list', 'accord')}s
					</h5>
					{#each $patients
						.find((p) => p.patient_id === patient.patient_id)
						.situations_pathologiques.find((rsp) => rsp.sp_id === sp.sp_id)
						.documents.filter((d) => [0, 1].includes(d.docType)) as accord}
						<div
							class="flex flex-col justify-between rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100 dark:hover:bg-surface-700">
							<!--? Accord CONTROLS  -->
							<div class="mb-2 flex items-center space-x-4">
								<h5
									class="pointer-events-none select-none text-secondary-800 dark:text-secondary-200">
									{$t('document.list', 'card.title', {
										date: dayjs(accord.created_at).format('DD/MM/YYYY')
									})}
								</h5>
								<div class="flex space-x-2">
									<a
										href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/documents/${accord.document_id}/update`}
										class="variant-outline-warning btn-icon btn-icon-sm"
										><UpdateIcon class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></a>
									<button
										on:click={async () => {
											modalStore.trigger({
												title: $t('document.list', 'deleteModal.title'),
												body: $t('document.list', 'deleteModal.body'),
												buttonTextConfirm: $t('shared', 'confirm'),
												buttonTextCancel: $t('shared', 'cancel'),
												type: 'confirm',
												response: async (response) => {
													if (response) {
														let a = instantiateAccord(accord);
														await a.delete();
													}
												}
											});
										}}
										class="variant-outline-error btn-icon btn-icon-sm"
										><DeleteIcon
											class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
									<button
										class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
										on:click={async () => {
											console.log('accord', accord);
											let annexe = instantiateAccord(accord);
											await annexe.save_file();
											await annexe.open();
										}}><OpenIcon class="h-5 w-5" /></button>
								</div>
							</div>
							<!--? Accord INFO -->
							<div class="flex flex-col text-success-800 dark:text-surface-100"></div>
						</div>
					{/each}
				</div>
			{:else}
				{$t('document.list', 'empty')}
			{/if}
		</div>
		<!-- <div class="flex flex-col flex-wrap">
            * Testing LIST (à venir) 
            <div class="flex flex-col">Testings (à venir)</div>
		</div> -->
	</main>
</div>
