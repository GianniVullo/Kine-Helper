<script>
	import { FormWrapper, SubmitButton, DateField } from '../index';
	import SituationPathologiqueSelector from './SituationPathologiqueSelector.svelte';
	import { AnnexeB } from '../../pdfs/annexeB';
	import { goto } from '$app/navigation';

	let message = '';

	export let patient;
	export let sp;
	let situationPathologique;
	let date;

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
		let annexeB = new AnnexeB(
			{
				situation_pathologique: situationPathologique,
				date
			},
			patient,
			sp
		);
		await annexeB.save();
		goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id + '/documents');
		submitter.disabled = false;
	}
</script>

<FormWrapper {formSchema}>
	<DateField bind:value={date} label="Date de la première séance" required />
	<SituationPathologiqueSelector aOrB="B" />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
