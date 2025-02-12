<script>
	import AttestationForm from '$lib/forms/attestation/AttestationForm.svelte';
	import { printAttestation } from '$lib/utils/rawPrinting';
	import { FormWrapper, SubmitButton } from '$lib/forms/index';
	import DBAdapter from '$lib/user-ops-handlers/dbAdapter';	import dayjs from 'dayjs';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { setContext } from 'svelte';
	import {
		createAttestationFormState,
		updateAttestationFormState
	} from '../attestationFormStore.svelte';
	import { user } from '$lib/index';
	import { patients } from '$lib/stores/PatientStore';
	import { goto } from '$app/navigation';
	import { t } from '../../../../../../../../lib/i18n';

	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	let untill = $page.url.searchParams.get('untill');
	let { state, loading, codeMap } = createAttestationFormState(patient, untill, $page);
	setContext('codeMap', codeMap);
	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	class AttestationSaver {
		constructor(attestation, seances, prescription) {
			this.toBeProduced = attestation.toBeProduced;
			this.attestation = {
				attestation_id: crypto.randomUUID(),
				patient_id: patient.patient_id,
				sp_id: sp.sp_id,
				porte_prescr: attestation.porte_prescr,
				numero_etablissement: attestation.numero_etablissement,
				service: attestation.service,
				has_been_printed: attestation.has_been_printed,
				prescription_id: prescription.prescription_id,
				total_recu: attestation.total_recu,
				valeur_totale: attestation.valeur_totale,
				with_indemnity: attestation.with_indemnity,
				with_intake: attestation.with_intake,
				with_rapport: attestation.with_rapport,
				date: attestation.date,
				user_id: get(user).user.id
			};
			this.seances = seances
				.filter((seance) => seance.selected)
				.map((seanceState) => {
					let seance = seanceState.obj;
					return {
						seance_id: seance.seance_id,
						date: seance.date,
						has_been_attested: true,
						code_id: seance.code_id,
						attestation_id: this.attestation.attestation_id
					};
				});
			this.prescr = prescription;
		}
		async save() {
			if (!this.toBeProduced) return;

			let dbAdapter = new DBAdapter();
			let attestation = await dbAdapter.save('attestations', this.attestation);
			attestation = attestation.data[0];
			attestation.porte_prescr = JSON.parse(attestation.porte_prescr);
			attestation.with_indemnity = JSON.parse(attestation.with_indemnity);
			attestation.with_intake = JSON.parse(attestation.with_intake);
			attestation.with_rapport = JSON.parse(attestation.with_rapport);
			attestation.has_been_printed = JSON.parse(attestation.has_been_printed);
			await dbAdapter.update_seances(this.seances);
			console.log('attestation', attestation, 'seances', this.seances);
			let jointe_a =
				typeof this.attestation.date === 'string'
					? this.attestation.date
					: dayjs(this.attestation.date).format('YYYY-MM-DD');
			if (this.attestation.porte_prescr) {
				await dbAdapter.update(
					'prescriptions',
					[['prescription_id', attestation.prescription_id], 'user_id', get(user).user.id],
					{
						...this.prescr,
						jointe_a
					}
				);
				this.prescr.jointe_a = jointe_a;
			}
			// attestation.seances = seances;
			// sp.attestations.push(attestation);
			patients.update((p) => {
				let rpatient = p.find((p) => p.patient_id === patient.patient_id);
				let rsp = rpatient.situations_pathologiques.find((tsp) => tsp.sp_id === sp.sp_id);
				rsp.attestations.push(attestation);
				if (attestation.porte_prescr) {
					rsp.prescriptions.find(
						(p) => p.prescription_id === attestation.prescription_id
					).jointe_a = jointe_a;
				}
				rsp.seances = rsp.seances.map((seance) => {
					let rseance = this.seances.find((s) => s.seance_id === seance.seance_id);
					if (rseance) {
						seance.has_been_attested = true;
						seance.attestation_id = attestation.attestation_id;
						seance.code_id = rseance.code_id;
						seance.date = rseance.date;
					}
					return seance;
				});
				return p;
			});
		}
	}
	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData, $state);
		let codes = [];
		let codesNumber = 0;
		let totalValeurRecue = 0.0;
		let totalRemboursement = 0.0;
		for (let prescription of $state) {
			for (let attestation of prescription.attestations) {
				console.log('attestation in Second Loop', attestation);
				// <!--*  ÉTAPE 1 : SAUVEGARDE DES ATTESTATIONS ET MISES À JOUR DES SÉANCES -->
				let saver = new AttestationSaver(attestation, attestation.seances, prescription.obj);
				await saver.save();
				// <!--*  ÉTAPE 2 : IMPRESSION DES ATTESTATIONS -->
				if (attestation.has_been_printed) {
					await printAttestation(patient, prescription.obj, attestation, sp, $codeMap);
				}
				// <!--*  ÉTAPE 3 : IMPRIMER DES FACTURE -->
				// nous demandons à l'utilisateur s'il veut imprimer une ou des factures au travers d'un modal
				attestation.seances.forEach((seance) => {
					if (!codes.includes(seance.code_reference)) {
						codes.push(seance.code_reference);
					}
				});
				let codesNumberSubTotal = attestation.seances.length;
				if (attestation.with_indemnity) {
					codes.push($codeMap.get('indemnites')[0]);
					codesNumberSubTotal = codesNumberSubTotal * 2;
				}
				if (attestation.with_intake) {
					codes.push($codeMap.get('intake')[0]);
					codesNumberSubTotal++;
				}
				if (attestation.with_rapport) {
					codes.push($codeMap.get('rapports')[0]);
					codesNumberSubTotal++;
				}
				codesNumber += codesNumberSubTotal;
				totalValeurRecue += attestation.total_recu;
				totalRemboursement += attestation.valeur_totale - attestation.total_recu;
			}
		}
		// <!--*  ÉTAPE 4 : REDIRIGER VERS ? -->
		// Ensuite il faut rediriger vers le dashboard qui est maintenant atualisé Ou vers la page Attestations ??
		goto(`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`);
	}
	function updateState() {
		updateAttestationFormState(patient, $state, $page, $codeMap);
		state.update((s) => s);
	}
</script>

<FormWrapper {formSchema}>
	{#if $loading}
		{$t('shared', 'loading')}
	{:else}
		{#each $state as prescription}
			<div class="card flex h-[85vh] flex-col items-start overflow-x-scroll px-8 py-4 md:w-[75vw]">
				<h5 class="mb-4 text-xl text-surface-700 dark:text-surface-100">
					{$t('attestation.create', 'prescription.group', {
						prescripteurFullName: `${prescription.obj.prescripteur.nom} ${prescription.obj.prescripteur.prenom}`,
						date: dayjs(prescription.obj.date).format('DD/MM/YYYY')
					})}
				</h5>
				<div class="flex">
					{#each prescription.attestations as attestation, padding}
						<div
							class="card mr-4 flex flex-col items-start justify-start rounded-xl !bg-surface-200 p-2 shadow-md last:mr-0 dark:!bg-surface-700 dark:shadow-none">
							<h5
								class="mb-4 border-b border-secondary-400 text-xl text-secondary-700 dark:text-secondary-400">
								{$t('attestation.create', 'attestation.group', { number: padding + 1 })}
							</h5>
							<AttestationForm donnees={attestation} {padding} {updateState} {codeMap} />
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
	<SubmitButton />
</FormWrapper>
