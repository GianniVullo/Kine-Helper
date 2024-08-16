<script>
	import { page } from '$app/stores';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import dayjs from 'dayjs';
	import { OpenIcon, DeleteIcon, UpdateIcon, PlusIcon } from '$lib/ui/svgs/index';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import DBAdapter from '$lib/forms/actions/dbAdapter';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { open } from '@tauri-apps/plugin-shell';
	import { user } from '$lib/stores/UserStore';
	import { invoke } from '@tauri-apps/api/core';
	import { t } from '../../../../../../../lib/i18n';
	import { file_exists, open_file, remove_file } from '../../../../../../../lib/utils/fsAccessor';

	const modalStore = getModalStore();

	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);

	async function prescriptionPath(prescription) {
		return `${$user.user.id}/${patient.nom}-${patient.prenom}(${patient.patient_id})/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions/${prescription.prescripteur.nom}-${prescription.prescripteur.prenom}-${prescription.date}(${prescription.prescription_id}).${prescription.file_name}`;
	}

	async function deletePrescription(prescription) {
		// First delete with the DBAdapter
		let db = new DBAdapter();
		await db.delete('prescriptions', ['prescription_id', prescription.prescription_id]);
		patients.update((ps) => {
			let p = ps.find((p) => p.patient_id === patient.patient_id);
			let sp = p.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
			sp.prescriptions = sp.prescriptions.filter(
				(p) => p.prescription_id !== prescription.prescription_id
			);
			return ps;
		});
		let path = await prescriptionPath(prescription);
		if (await file_exists(path)) {
			await remove_file(path);
		}
	}
	async function openPrescription(prescription) {
		let path = await prescriptionPath(prescription);
		console.log('path', path);
		let pathExists = await file_exists(path);
		console.log('pathExists', pathExists);
		if (pathExists) {
			await open_file(path);
		}
	}
</script>

{#if sp.prescriptions.length > 0}
	<div class="ml-2 flex flex-col items-start justify-start space-y-4">
		<div class="flex flex-col justify-between">
			<h5 class="text-lg text-surface-500 dark:text-surface-400">
				{$t('prescription.list', 'title', { date: dayjs(sp.created_at).format('DD/MM/YYYY') })}
			</h5>
			<div class="flex">
				<a
					href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`}
					class="variant-outline-secondary btn btn-sm my-2 flex">
					<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
					<span class="text-sm text-surface-500 dark:text-surface-400"
						>{$t('prescription.list', 'add')}</span
					></a>
			</div>
		</div>

		<div class="flex flex-wrap items-start justify-start">
			{#each $patients
				.find((p) => p.patient_id === $page.params.patientId)
				.situations_pathologiques.find((rsp) => rsp.sp_id === $page.params.spId).prescriptions as prescription}
				<!--* PRESCRIPTION BOX  -->
				<div
					class="mb-2 mr-2 flex flex-col justify-between rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100 dark:hover:bg-surface-800/50">
					<!--* Header -->
					<div class="mb-2 flex items-center justify-between space-x-4">
						<h5 class="pointer-events-none select-none text-secondary-800 dark:text-secondary-200">
							{$t('prescription.list', 'card.title', {
								date: dayjs(prescription.date).format('DD/MM/YYYY')
							})}
						</h5>
						<!--? Prescription CONTROLS  -->
						<div class="flex space-x-2">
							<a
								href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/${prescription.prescription_id}/update`}
								class="variant-outline-warning btn-icon btn-icon-sm"
								><UpdateIcon class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></a>
							{#if sp.seances.filter((s) => s.prescription_id === prescription.prescription_id).length === 0}
								<button
									on:click={async () => {
										modalStore.trigger({
											title: $t('prescription.list', 'deleteModal.title'),
											body: $t('prescription.list', 'deleteModal.body'),
											buttonTextConfirm: $t('shared', 'confirm'),
											buttonTextCancel: $t('shared', 'cancel'),
											type: 'confirm',
											response: async (response) => {
												if (response) {
													await deletePrescription(prescription);
												}
											}
										});
									}}
									class="variant-outline-error btn-icon btn-icon-sm"
									><DeleteIcon
										class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
							{/if}
							<button
								on:click={async () => {
									console.log('open prescription');
									if (prescription.file_name) {
										await openPrescription(prescription);
									} else {
										console.log('no file');
										modalStore.trigger({
											type: 'alert',
											title: $t('prescription.list', 'alertModal.title'),
											body: $t('prescription.list', 'alertModal.body')
										});
									}
								}}
								class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
								><OpenIcon class="h-5 w-5" /></button>
						</div>
					</div>
					<!--* Body -->
					<div class="flex flex-col text-surface-800 dark:text-surface-100">
						<h5 class="text-secondary-500">
							{@html $t('prescription.list', 'card.subtitle', {
								prescripteurFullName: `${prescription.prescripteur.nom} ${prescription.prescripteur.prenom}`
							})} <br />
						</h5>
						<p class="mb-1 text-surface-400">{prescription.prescripteur.inami}</p>
						<h5 class="text-surface-700 dark:text-surface-300">
							<span class="font-medium text-surface-800 dark:text-surface-200"
								>{prescription.nombre_seance}</span>
							{$t('patients.detail', 'prestations')}
							<br />
							<span class="font-medium text-surface-800 dark:text-surface-200"
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
