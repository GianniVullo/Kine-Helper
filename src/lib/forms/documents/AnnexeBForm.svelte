<script>
	import { FormWrapper, SubmitButton, DateField, RadioFieldV2 } from '../index';
	import DBAdapter from '../actions/dbAdapter';

	let message = '';

	export let patient;
	export let sp;
	let situationPathologique;
	let date;
	let options = [
		"Situations nécessitant une rééducation fonctionnelle de la marche pour les bénéficiaires de 65 ans et plus ayant un risque de chute, avec évaluation par 'Timed up & go' et soit 'Tinetti' soit 'Timed chair stands'.",
		'Troubles du développement psychomoteur chez les enfants de moins de 16 ans, évalués par un médecin spécialiste avec un score faible sur un test standardisé ou par une équipe multidisciplinaire pour ceux de moins de 19 mois.',
		"Insuffisance respiratoire chez les bénéficiaires suivis pour l'oxygénothérapie de longue durée à domicile ou respiration artificielle à domicile.",
		'Polyneuropathie chronique motrice ou mixte.',
		'Syndrome de fatigue chronique selon les conditions de la nomenclature.',
		"Syndrome fibromyalgique confirmé par un spécialiste en rhumatologie ou médecine physique, avec critères de diagnostic de l'ACR.",
		"Dystonie cervicale primaire confirmée par diagnostic d'un neurologue.",
		'Lymphoedème selon les conditions de la nomenclature.'
	].map((label, index) => ({ label, value: index }));

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		console.log('in IsValid with', formData);
		let db = new DBAdapter();
		await db.save('documents', {
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			date: date,
			type: 0,
			situation_pathologique: situationPathologique
		});
		submitter.disabled = false;
	}
</script>

<FormWrapper {formSchema}>
	<!--* Fields here -->
	<DateField bind:value={date} label="Date de la première séance" required />
	<RadioFieldV2
		bind:value={situationPathologique}
		label="Situation pathologique"
		name="docType"
		required
		{options} />
	<div class="font-semibold">{message}</div>
	<SubmitButton>Envoyer</SubmitButton>
</FormWrapper>
