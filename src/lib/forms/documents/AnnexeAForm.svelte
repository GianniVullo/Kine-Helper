<script>
	import { FormWrapper, SubmitButton, DateField, RadioFieldV2 } from '../index';
	import DBAdapter from '../actions/dbAdapter';
	import SituationPathologiqueSelector from './SituationPathologiqueSelector.svelte';
	import { patients } from '../../stores/PatientStore';
	import { goto } from '$app/navigation';
	import { user } from '../../stores/UserStore';
	import { get } from 'svelte/store';
	import { AnnexeA } from '../../pdfs/annexeA';

	let message = '';

	export let patient;
	export let sp;
	let situationPathologique = [];
	let date;
	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
		console.log('situationPathologique', situationPathologique);
		if (!situationPathologique) {
			message = 'Veuillez sélectionner une situation pathologique';
			submitter.disabled = false;
			return;
		}
		let annexeA = new AnnexeA(
			{
				situation_pathologique: situationPathologique,
				date
			},
			patient,
			sp
		);
		await annexeA.save();
		goto(
			'/dashboard/patients/' +
				patient.patient_id +
				'/situation-pathologique/' +
				sp.sp_id +
				'/documents'
		);
		submitter.disabled = false;
	}
</script>

<FormWrapper {formSchema}>
	<DateField bind:value={date} label="Date de la première séance" name="date" required />
	<SituationPathologiqueSelector aOrB="A" bind:value={situationPathologique} />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
