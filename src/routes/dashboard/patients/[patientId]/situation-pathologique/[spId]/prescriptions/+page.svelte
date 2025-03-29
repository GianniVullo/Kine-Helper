<script>
	import dayjs from 'dayjs';
	import { OpenIcon, DeleteIcon, UpdateIcon, PlusIcon } from '$lib/ui/svgs/index';
	import { t } from '../../../../../../../lib/i18n';
	import {
		deletePrescription,
		openPrescription
	} from '../../../../../../../lib/user-ops-handlers/prescriptions';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Modal from '../../../../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { openModal } from '../../../../../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { cloneDeep } from 'lodash';

	let { data } = $props();

	let patient = $state(data.patient);
	let sp = $state(data.sp);
</script>

<Modal
	opened={page.state?.modal?.name === 'deletePrescription'}
	title={$t('prescription.list', 'deleteModal.title')}
	body={$t('prescription.list', 'deleteModal.body')}
	buttonTextConfirm={$t('shared', 'confirm')}
	buttonTextCancel={$t('shared', 'cancel')}
	onAccepted={async () => {
		const { error } = await deletePrescription(page.state.modal.prescription);
		await invalidateAll();
		patient = page.data.patient;
		sp = page.data.sp;
	}} />

<Modal
	opened={page.state?.modal?.name === 'noFile'}
	title={$t('prescription.list', 'alertModal.title')}
	body={$t('prescription.list', 'alertModal.body')} />

{#if sp.prescriptions.length > 0}
	<div class="ml-2 flex flex-col items-start justify-start space-y-4">
		<div class="flex flex-col justify-between">
			<h5 class="text-surface-500 dark:text-surface-400 text-lg">
				{$t('prescription.list', 'title', { date: dayjs(sp.created_at).format('DD/MM/YYYY') })}
			</h5>
			<div class="flex">
				<a
					href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`}
					class="variant-outline-secondary btn btn-sm my-2 flex">
					<PlusIcon class="stroke-surface-600 dark:stroke-surface-300 h-4 w-4" />
					<span class="text-surface-500 dark:text-surface-400 text-sm"
						>{$t('prescription.list', 'add')}</span
					></a>
			</div>
		</div>

		<div class="flex flex-wrap items-start justify-start">
			{#each sp.prescriptions as prescription}
				<!--* PRESCRIPTION BOX  -->
				<div
					class="border-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 mr-2 mb-2 flex flex-col justify-between rounded-lg border px-4 py-2 shadow duration-200">
					<!--* Header -->
					<div class="mb-2 flex items-center justify-between space-x-4">
						<h5 class="text-secondary-800 dark:text-secondary-200 pointer-events-none select-none">
							{$t('prescription.list', 'card.title', {
								date: dayjs(prescription.date).format('DD/MM/YYYY')
							})}
						</h5>
						<!--? Prescription CONTROLS  -->
						<div class="flex space-x-2">
							<a
								href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/${prescription.prescription_id}/update`}
								class="variant-outline-warning btn-icon btn-icon-sm"
								><UpdateIcon class="stroke-surface-600 dark:stroke-surface-200 h-5 w-5" /></a>
							{#if sp.seances.filter((s) => s.prescription_id === prescription.prescription_id).length === 0}
								<button
									onclick={async () => {
										openModal({
											name: 'deletePrescription',
											prescription: cloneDeep($state.snapshot(prescription))
										});
									}}
									class="variant-outline-error btn-icon btn-icon-sm"
									><DeleteIcon
										class="stroke-surface-600 dark:stroke-surface-200 h-5 w-5" /></button>
							{/if}
							{#if prescription.file_name}
								<button
									onclick={async (e) => {
										if (prescription.file_name) {
											e.target.disabled = true;
											let error = await openPrescription(prescription);
											console.log('the error', error);
											e.target.disabled = false;
										} else {
											openModal({ name: noFile });
										}
									}}
									class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
									><OpenIcon class="h-5 w-5" /></button>
							{:else}
								<button class="variant-filled btn-icon btn-icon-sm dark:variant-filled" disabled>
									<OpenIcon class="h-5 w-5" />
								</button>
							{/if}
						</div>
					</div>
					<!--* Body -->
					<div class="text-surface-800 dark:text-surface-100 flex flex-col">
						<h5 class="text-secondary-500">
							{@html $t('prescription.list', 'card.subtitle', {
								prescripteurFullName: `${prescription.prescripteur.nom} ${prescription.prescripteur.prenom}`
							})} <br />
						</h5>
						<p class="text-surface-400 mb-1">{prescription.prescripteur.inami}</p>
						<h5 class="text-surface-700 dark:text-surface-300">
							<span class="text-surface-800 dark:text-surface-200 font-medium"
								>{prescription.nombre_seance}</span>
							{$t('patients.detail', 'prestations')}
							<br />
							<span class="text-surface-800 dark:text-surface-200 font-medium"
								>{prescription.seance_par_semaine}</span>
							{$t('prescription.list', 'card.timesPerWeek')}.
						</h5>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>{$t('prescription.list', 'empty')}</p>
{/if}
