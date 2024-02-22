<script>
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { PlusIcon } from '$lib/ui/svgs/index';
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import { printAttestation } from '../../../../../../../lib/utils/rawPrinting';
	import { PrinterIcon, UpdateIcon, DeleteIcon } from '../../../../../../../lib/ui/svgs/index';
	import { user } from '../../../../../../../lib/stores/UserStore';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { fetchCodeDesSeances } from '../../../../../../../lib/utils/nomenclatureManager';
	import { open } from '@tauri-apps/plugin-shell';
	import { FacturePatient } from '../../../../../../../lib/pdfs/facturePatient';
	import { FactureMutuelle } from '../../../../../../../lib/pdfs/factureMutuelle';
	import DBAdapter from '../../../../../../../lib/forms/actions/dbAdapter';
	import { parse } from 'svelte/compiler';
	import FactureBox from '../../../../../../../lib/ui/FactureBox.svelte';

	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	const modalStore = getModalStore();
	function prescription(prescriptionId) {
		return sp.prescriptions.find((prescription) => prescription.prescription_id === prescriptionId);
	}
	const documentSelectionModal = {
		type: 'component',
		component: 'factureCreation',
		meta: { sp: sp }
	};
	console.log(sp);
</script>

{#if sp.attestations.length > 0}
	<!--* TITRE -->
	<div class="ml-2 flex flex-col space-y-4">
		<div class="flex flex-col">
			<h5 class="text-lg text-surface-500 dark:text-surface-400">
				Attestations et factures de la situation pathologique du {dayjs(sp.created_at).format(
					'DD/MM/YYYY'
				)}
			</h5>
			<div class="flex">
				<button
					on:click={() => modalStore.trigger(documentSelectionModal)}
					class="variant-outline-secondary btn btn-sm my-2 flex">
					<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
					<span class="text-sm text-surface-500 dark:text-surface-400">Facture</span></button>
			</div>
		</div>
		<div class="flex space-x-4">
			<!--* ATTESTATIONS LIST -->
			<div class="flex space-x-2">
				<div class="flex flex-col space-y-2">
					{#each sp.attestations as attestation}
						<div
							class="flex flex-col justify-between rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100 dark:hover:bg-surface-700">
							<!--? ATTESTATION CONTROLS  -->
							<div class="mb-2 flex items-center space-x-4">
								<h5
									class="pointer-events-none select-none text-secondary-800 dark:text-secondary-200">
									Attestation du {dayjs(attestation.date).format('DD/MM/YYYY')}
								</h5>
								<div class="flex space-x-2">
									<button class="variant-outline-warning btn-icon btn-icon-sm"
										><UpdateIcon
											class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
									<button class="variant-outline-error btn-icon btn-icon-sm"
										><DeleteIcon
											class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
									<button
										class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
										on:click={async () => {
											modalStore.trigger({
												title: 'Impression',
												body: `Voulez-vous imprimer l'attestation du ${dayjs(
													attestation.date
												).format('DD/MM/YYYY')} ?`,
												type: 'confirm',
												response: async (response) => {
													if (response) {
														await printAttestation(
															patient,
															prescription(attestation.prescription_id),
															attestation,
															sp,
															await fetchCodeDesSeances(
																null,
																sp.seances.filter(
																	(s) => s.attestation_id === attestation.attestation_id
																),
																sp
															)
														);
													}
												}
											});
										}}><PrinterIcon class="h-5 w-5" /></button>
								</div>
							</div>
							<!--? ATTESTATION INFO -->
							<div class="flex flex-col text-success-800 dark:text-surface-100">
								{#if attestation.porte_prescr}
									<h5>Porte la prescription</h5>
								{/if}
								{#if attestation.mutuelle_paid}
									<h5>Payée par la mutuelle</h5>
								{/if}
								{#if attestation.patient_paid}
									<h5>Payée par le patient</h5>
								{/if}
								<h5><span class="text-surface-400">Total reçu:</span> {attestation.total_recu}€</h5>
								<h5>
									<span class="text-surface-400">Valeur totale:</span>
									{attestation.valeur_totale}€
								</h5>
							</div>
						</div>
					{/each}
				</div>
			</div>
			<!--* FACTURE LIST -->
			<div class="flex space-x-2">
				<div class="flex flex-col space-y-2">
					{#each $patients
						.find((p) => p.patient_id === $page.params.patientId)
						.situations_pathologiques.find((rsp) => rsp.sp_id === $page.params.spId)
						.documents.filter((d) => [8, 9].includes(d.docType)) as facture}
						<FactureBox {facture} {patient} {sp} />
					{/each}
				</div>
			</div>
		</div>
	</div>
{:else}
	<p>Il n'y a pas encore d'attestations pour cette situation pathologique.</p>
{/if}
