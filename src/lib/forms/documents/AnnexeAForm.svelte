<script>
	import { FormWrapper, SubmitButton, DateField } from '../index';
	import DBAdapter from '../actions/dbAdapter';
	import SituationPathologiqueSelector from './SituationPathologiqueSelector.svelte';
	import { goto } from '$app/navigation';
	import { AnnexeA } from '../../pdfs/annexeA';
	import { patients } from '../../stores/PatientStore';

	let message = '';

	export let patient;
	export let sp;
	export let doc = null;
	let situationPathologique = doc ? doc.form_data.situation_pathologique : [];
	let date = doc?.form_data.date;
	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData, situationPathologique);
		if (
			![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(
				parseInt(situationPathologique)
			)
		) {
			message = 'Veuillez sélectionner une situation pathologique';
			submitter.disabled = false;
			return;
		}
		if (doc) {
			let db = new DBAdapter();
			await db.update('documents', [['document_id', doc.document_id]], {
				form_data: JSON.stringify({
					date,
					situation_pathologique: situationPathologique
				})
			});
			patients.update((ps) => {
				let p = ps.find((p) => p.patient_id === patient.patient_id);
				let rsp = p.situations_pathologiques.find((tsp) => tsp.sp_id === sp.sp_id);
				let rdoc = rsp.documents.find((tdoc) => tdoc.document_id === doc.document_id);
				rdoc.form_data = {
					date,
					situation_pathologique: situationPathologique
				};
				return ps;
			});

			let annexeA = new AnnexeA(
				{
					situation_pathologique: situationPathologique,
					date
				},
				patient,
				sp,
				doc
			);
			await annexeA.save_file();
			await annexeA.open();
		} else {
			let annexeA = new AnnexeA(
				{
					situation_pathologique: situationPathologique,
					date
				},
				patient,
				sp,
				null
			);
			await annexeA.save();
		}
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
