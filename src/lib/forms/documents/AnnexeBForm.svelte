<script>
	import { FormWrapper, SubmitButton, DateField, RadioFieldV2 } from '../index';
	import SituationPathologiqueSelector from './SituationPathologiqueSelector.svelte';
	import { AnnexeB } from '../../pdfs/annexeB';
	import { goto } from '$app/navigation';
	import DBAdapter from '../actions/dbAdapter';
	import { patients } from '../../stores/PatientStore';

	let message = '';

	export let patient;
	export let sp;
	export let doc = null;
	console.log('doc', doc);
	let situationPathologique = doc ? doc.form_data.situation_pathologique : [];
	let date = doc?.form_data.date;
	let notification = doc?.form_data.notification ?? true;
	console.log('situationPathologique', situationPathologique);
	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		let formObj = {
			situation_pathologique: situationPathologique,
			date,
			notification
		};
		if (doc) {
			let db = new DBAdapter();
			await db.update('documents', [['document_id', doc.document_id]], {
				form_data: JSON.stringify({
					date,
					notification,
					situation_pathologique: situationPathologique
				})
			});
			patients.update((ps) => {
				let p = ps.find((p) => p.patient_id === patient.patient_id);
				let rsp = p.situations_pathologiques.find((tsp) => tsp.sp_id === sp.sp_id);
				let rdoc = rsp.documents.find((tdoc) => tdoc.document_id === doc.document_id);
				rdoc.form_data = {
					date,
					notification,
					situation_pathologique: situationPathologique
				};
				return ps;
			});
			let annexeB = new AnnexeB(formObj, patient, sp, doc);
			await annexeB.save_file();
			await annexeB.open();
		} else {
			let annexeB = new AnnexeB(formObj, patient, sp);
			await annexeB.save();
		}
		console.log('in IsValid with', formObj);
		goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id);
		submitter.disabled = false;
	}
	let options = [
		{ value: true, label: 'Notification' },
		{ value: false, label: 'Renouvellement' }
	];
</script>

<FormWrapper {formSchema}>
	<RadioFieldV2
		bind:value={notification}
		label="Renouvellement ou Notification ?"
		name="notification"
		required
		{options} />
	<DateField bind:value={date} name="date" label="Date de la première séance" required />
	<SituationPathologiqueSelector aOrB="B" bind:value={situationPathologique} />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
