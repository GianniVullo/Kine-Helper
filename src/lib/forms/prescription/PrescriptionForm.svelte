<script>
	import { FormWrapper, NumberField, DateField, SubmitButton } from '../index';
	import PrescripteurField from './PrescripteurField.svelte';
	import FileField from './FileField.svelte';
	import { user } from '$lib/index';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import dayjs from 'dayjs';
	import { t } from '../../i18n';
	import { save_to_disk } from '../../utils/fsAccessor';
	import { createPrescription, updatePrescription } from '../../user-ops-handlers/prescriptions';

	export let prescription = null;
	export let patient;
	export let sp;
	let prescription_id = prescription?.prescription_id ?? crypto.randomUUID();
	let date = prescription?.date;
	let jointe_a = prescription?.jointe_a;
	let nombre_seance = prescription?.nombre_seance;
	let seance_par_semaine = prescription?.seance_par_semaine;
	let prescripteurNom = prescription?.prescripteur?.nom;
	let prescripteurPrenom = prescription?.prescripteur?.prenom;
	let prescripteurInami = prescription?.prescripteur?.inami;
	let fileField;
	let files;

	let message = '';

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		let { fileResponse, buffer } = fileField.getBufferAndResponse();
		console.log('fileField', fileField);
		let filExt = fileResponse?.path.split('.').pop();
		console.log('fileResponse', fileResponse);
		let compiledFormData = {
			user_id: get(user).user.id,
			prescription_id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			active: true,
			date,
			jointe_a,
			nombre_seance,
			seance_par_semaine,
			prescripteur: JSON.stringify({
				nom: prescripteurNom,
				prenom: prescripteurPrenom,
				inami: prescripteurInami
			}),
			file_name: filExt
		};
		let data = {
			prescription: compiledFormData,
			fileResponse,
			buffer,
			filePath: `${get(user).user.id}/${patient.nom}-${patient.prenom}(${
				patient.patient_id
			})/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions`,
			fileName: `${prescripteurNom}-${prescripteurPrenom}-${date}(${prescription_id}).${filExt}`
		};
		if (prescription) {
			await updatePrescription(data);
			goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id);
			return;
		}
		data.prescription.created_at = dayjs().format('YYYY-MM-DD');
		await createPrescription(data);
		goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id);
	}
</script>

<FormWrapper {formSchema}>
	<PrescripteurField bind:prescripteurNom bind:prescripteurPrenom bind:prescripteurInami />
	<DateField label={$t('form.prescription', 'date.label')} bind:value={date} name="date" />
	<NumberField
		bind:value={nombre_seance}
		name="nombre_seance"
		label={$t('form.prescription', 'nombre_seance.label')} />
	<NumberField
		bind:value={seance_par_semaine}
		name="seance_par_semaine"
		label={$t('form.prescription', 'seance_par_semaine.label')} />
	<FileField
		bind:this={fileField}
		filePath={prescription?.file_name
			? `${get(user).user.id}/${patient.nom}-${patient.prenom}(${
					patient.patient_id
			  })/situation-pathologique-${sp.created_at}(${
					sp.sp_id
			  })/prescriptions/${prescripteurNom}-${prescripteurPrenom}-${date}(${prescription_id}).${
					prescription.file_name
			  }`
			: null}
		withOpener={true}
		label={$t('form.prescription', 'copy.label')} />
	<DateField
		label={$t('form.prescription', 'jointe_a.label')}
		bind:value={jointe_a}
		name="jointe_a" />
	<p>
		{$t('form.prescription', 'jointe_a.help')}
	</p>

	<div class="font-semibold">{message}</div>
	<SubmitButton />
</FormWrapper>
