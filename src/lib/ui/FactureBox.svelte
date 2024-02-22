<script>
	import { OpenIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import dayjs from 'dayjs';
	import DBAdapter from '../forms/actions/dbAdapter';
	import { patients } from '../stores/PatientStore';
	import { page } from '$app/stores';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { open } from '@tauri-apps/plugin-shell';
	import { FacturePatient } from '$lib/pdfs/facturePatient';
	import { FactureMutuelle } from '$lib/pdfs/factureMutuelle';
	import { user } from '$lib/stores/UserStore';

	const modalStore = getModalStore();
	export let facture;
	export let patient;
	export let sp;
	let clazz = '';
	export { clazz as class };

    function attestationIdsArrayMapper(attestationsIds) {
		return attestationsIds.map((attId) => {
			return sp.attestations.find((att) => att.attestation_id === attId);
		});
	}
</script>

<div
	class="flex flex-col justify-between rounded-lg border border-surface-400 px-4 py-2 shadow duration-200 hover:bg-surface-100 dark:hover:bg-surface-700">
	<div class="flex items-center space-x-4 {clazz}">
		<h5 class="pointer-events-none select-none text-secondary-800 dark:text-secondary-200">
			Facture <span class="font-medium">{facture.docType === 8 ? 'patient' : 'mutuelle'}</span>
			du {dayjs(facture.created_at).format('DD/MM/YYYY')}
		</h5>
		<!--? FACTURE CONTROLS  -->
		<div class="flex space-x-2">
			<!--! ne pas permmettre de modifier une facture
        <button class="variant-outline-warning btn-icon btn-icon-sm"
            ><UpdateIcon
                class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button> -->
			<button
				on:click={async () => {
					modalStore.trigger({
						title: 'Confirmation',
						body: `êtes-vous sûr de vouloir supprimer définitivement la facture du ${dayjs(
							facture.date
						).format('DD/MM/YYYY')}`,
						type: 'confirm',
						response: async (response) => {
							if (response) {
								let db = new DBAdapter();
								console.log(await db.delete('documents', ['document_id', facture.document_id]));
								patients.update((ps) => {
									let p = ps.find((p) => p.patient_id === patient.patient_id);
									let sp = p.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
									sp.documents = sp.documents.filter((d) => d.document_id !== facture.document_id);
									return ps;
								});
							}
						}
					});
				}}
				class="variant-outline-error btn-icon btn-icon-sm"
				><DeleteIcon class="h-5 w-5 stroke-surface-600 dark:stroke-surface-200" /></button>
			<button
				on:click={async () => {
					let localDataDirPath = await appLocalDataDir();
					let f =
						facture.docType === 8
							? new FacturePatient(
									typeof facture.form_data === 'string'
										? JSON.parse(facture.form_data)
										: facture.form_data,
									patient,
									sp
							  )
							: new FactureMutuelle(
									typeof facture.form_data === 'string'
										? JSON.parse(facture.form_data)
										: facture.form_data,
									patient,
									sp
							  );
					async function openDoc() {
						await open(
							localDataDirPath +
								`/${$user.user.id}/${patient.patient_id}/documents/factures/${f.documentName}`
						);
					}
					try {
						await openDoc();
					} catch (error) {
						console.error(error);
						await f.save();
					}
				}}
				class="variant-filled btn-icon btn-icon-sm dark:variant-filled"
				><OpenIcon class="h-5 w-5" /></button>
		</div>
	</div>
	<div class="flex flex-col text-success-800 dark:text-surface-100">
		<h5 class="">
			<span class="text-surface-400">Attestations:</span>
		</h5>
		<ul class="mb-4">
			{#each typeof facture.form_data === 'string' ? attestationIdsArrayMapper(JSON.parse(facture.form_data).attestationsIds) : attestationIdsArrayMapper(facture.form_data.attestationsIds) as att}
				<li>
					&nbsp;&nbsp;&nbsp;&nbsp;
					{dayjs(att.date).format('DD/MM/YYYY') +
						` - ${
							sp.seances.filter((s) => s.attestation_id === att.attestation_id).length
						} prestations,`}
				</li>
			{/each}
		</ul>
		<h5>
			<span class="text-surface-400">Total:</span>
			{typeof facture.form_data === 'string'
				? JSON.parse(facture.form_data).total
				: facture.form_data.total}€
		</h5>
	</div>
</div>
