<script>
	import { FormWrapper, SubmitButton, DateField, NumberField, TextFieldV2 } from '../index';
	import { createCodeMap } from '../../utils/nomenclatureManager';
	import { page } from '$app/stores';
	import CheckboxFieldV2 from '../abstract-fields/CheckboxFieldV2.svelte';
	// import SeancesField from './SeancesField.svelte';
	import { patients } from '$lib/stores/PatientStore';

	export let attestation;
	export let codes;

	const codeMap = createCodeMap();
	codeMap.set(codes);
	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
	}
</script>

<FormWrapper {formSchema}>
	<!--* Fields here -->
	<div class="flex min-w-[30vw] flex-col">
		<div class="max-w-md space-y-4">
			<CheckboxFieldV2
				bind:value={attestation.mutuelle_paid}
				name={'mutuelle_paid'}
				label="Payée par le mutuelle" />
			<CheckboxFieldV2
				bind:value={attestation.patient_paid}
				name={'patient_paid'}
				label="Payée par le patient" />
			<NumberField bind:value={attestation.total_recu} name={'total_recu'} label="Total reçu" />
			<NumberField
				bind:value={attestation.valeur_totale}
				name={'valeur_totale'}
				label="Valeur totale" />
			<!-- <h4>Les séances</h4>
                <SeancesField seances={attestation.seances} /> -->
		</div>
	</div>

	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
