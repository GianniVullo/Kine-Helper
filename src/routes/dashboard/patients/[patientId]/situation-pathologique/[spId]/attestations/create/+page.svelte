<script>
	import AttestationForm from '$lib/forms/attestation/AttestationForm.svelte';
	import { printAttestation } from "$lib/utils/rawPrinting";
	import { FormWrapper, SubmitButton } from '$lib/forms/index';
	import DBAdapter from '$lib/forms/actions/dbAdapter';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { CheckboxFieldV2 } from '$lib/forms/index';
	import dayjs from 'dayjs';
	import { page } from '$app/stores';
	import { derived, get, writable } from 'svelte/store';
	import { getContext, setContext } from 'svelte';
	import {
		createAttestationFormState,
		updateAttestationFormState
	} from '../attestationFormStore.svelte';
	import { user } from "$lib/index";
	import {patients} from "$lib/stores/PatientStore";
	import { goto } from '$app/navigation';

	let patient = $page.data.patient;
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
				numero_etablissment: attestation.numero_etablissment,
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
		}
		async save() {
			if (!this.toBeProduced) return;
			let dbAdapter = new DBAdapter();
			let attestation = await dbAdapter.save('attestations', this.attestation);
			let seances = await dbAdapter.update_seances(this.seances);
			console.log('attestation', attestation, 'seances', seances);
			attestation = attestation.data[0];
			// attestation.seances = seances;
			sp.attestations.push(attestation);
			patients.update((p) => p);
			if (attestation.has_been_printed) {
				
			}
			goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id);
		}
	}
	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData, $state);
		// D'abords on doit enregistrer les attestations
		for (let prescription of $state) {
			for (let attestation of prescription.attestations) {
				let saver = new AttestationSaver(attestation, attestation.seances, prescription.obj);
				await saver.save();
			}
		}
		// Ensuite il faut rediriger vers le dashboard qui est maintenant atualisé
		// if Error
		// toastStore.trigger(
		// 		errorToast(
		// 			`<span class="text-error-700 text-lg">Erreur </span> <br>info : "${error}"`
		// 		)
		// 	);
		// 	throw new Error(error);
	}
	function updateState() {
		updateAttestationFormState(patient, $state, $page, $codeMap);
		state.update((s) => s);
	}
</script>

<button on:click={() => {
	printAttestation();
}}>
	TEST RUST Func
</button>
<FormWrapper {formSchema}>
	{#if $loading}
		chargement en cours
	{:else}
		{#each $state as prescription, i}
			<div class="card flex !w-auto flex-col items-start px-8 py-4">
				<h5 class="mb-4">
					{i + 1} Prescription du {dayjs(prescription.obj.date).format('DD/MM/YYYY')}
				</h5>
				{#each prescription.attestations as attestation, padding}
					<AttestationForm donnees={attestation} {padding} {updateState} {codeMap} />
				{/each}
			</div>
		{/each}
	{/if}
	<SubmitButton />
</FormWrapper>
