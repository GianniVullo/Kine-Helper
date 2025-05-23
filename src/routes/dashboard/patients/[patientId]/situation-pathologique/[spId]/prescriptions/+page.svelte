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
	import SectionTitle from '../../../../../../../lib/components/SectionTitle.svelte';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import CardTable from '../../../../../../../lib/components/CardTable.svelte';

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

<SectionTitle titre="Prescriptions">
	{#snippet actions()}
		<BoutonPrincipalAvecIcone
			href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`}
			icon={PlusIcon}
			inner={`&nbsp;${$t('prescription.list', 'add')}`} />
	{/snippet}
</SectionTitle>

{#if sp.prescriptions.length > 0}
	<CardTable>
		{#snippet header()}
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
				>Prescripteur</th>
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
				>Nombre</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
				><span class="sr-only">Supprimer</span></th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
				><span class="sr-only">Modifier</span></th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
				><span class="sr-only">Ouvrir</span></th>
		{/snippet}
		{#snippet body()}
			{#each sp.prescriptions as prescription}
				{@const hasNoSeancesAttached =
					sp.seances.filter((s) => s.prescription_id === prescription.prescription_id).length === 0}

				<tr>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
						{dayjs(prescription.date).format('DD/MM/YYYY')}
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
						<div class="text-gray-900">
							{prescription.prescripteur.nom}
							{prescription.prescripteur.prenom}
						</div>
						<div class="mt-1 text-gray-500">{prescription.prescripteur.inami}</div>
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
						{prescription.nombre_seance}
						{$t('patients.detail', 'prestations')}
					</td>
					<td
						class={{
							'relative py-5 pr-4 pl-3 text-sm font-medium whitespace-nowrap sm:pr-0': true,
							'text-left': !hasNoSeancesAttached,
							'text-right': hasNoSeancesAttached
						}}>
						{#if hasNoSeancesAttached}
							<button
								onclick={() => {
									openModal({
										name: 'deletePrescription',
										prescription: cloneDeep($state.snapshot(prescription))
									});
								}}
								class="mr-4 text-red-600 hover:text-red-900">
								Supprimer<span class="sr-only">, {patient.nom} {patient.prenom}</span>
							</button>
						{:else}
							<p class="font-normal">Ne peux pas être supprimée</p>
						{/if}
					</td>
					<td
						class="relative cursor-pointer py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
						<a
							href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/${prescription.prescription_id}/update`}
							class="mr-4 text-yellow-600 hover:text-yellow-900">
							Modifier<span class="sr-only">, {patient.nom} {patient.prenom}</span>
						</a>
					</td>

					<td
						class={{
							'relative py-5 pr-4 pl-3 text-sm font-medium whitespace-nowrap sm:pr-0': true,
							'text-right': prescription.file_name,
							'text-left': !prescription.file_name
						}}>
						{#if prescription.file_name}
							<button
								onclick={async (e) => {
									if (prescription.file_name) {
										e.target.disabled = true;
										let { error } = await openPrescription(prescription);
										console.log('the error', error);
										e.target.disabled = false;
										if (error) {
											openModal({ name: 'noFile' });
										}
									} else {
										openModal({ name: 'noFile' });
									}
								}}
								class="mr-4 text-indigo-600 hover:text-indigo-900">
								Ouvrir<span class="sr-only">, {patient.nom} {patient.prenom}</span>
							</button>
						{:else}
							<p class="mr-4 text-gray-400">
								Pas de fichier<span class="sr-only">, {patient.nom} {patient.prenom}</span>
							</p>
						{/if}
					</td>
				</tr>
			{/each}
		{/snippet}
	</CardTable>
{:else}
	<p class="mt-5">{$t('prescription.list', 'empty')}</p>
{/if}
