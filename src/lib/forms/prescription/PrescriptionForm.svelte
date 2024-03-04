<script>
	import { FormWrapper, NumberField, DateField, SubmitButton } from '../index';
	import PrescripteurField from './PrescripteurField.svelte';
	import FileField from './FileField.svelte';
	import DBAdapter from '../actions/dbAdapter';
	import { user } from '$lib/index';
	import { get } from 'svelte/store';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { patients } from '../../stores/PatientStore';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { invoke } from '@tauri-apps/api/core';
	import { t } from '../../i18n';

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

	let message = '';

	let formSchema = {
		isValid: isValid,
		validators: {}
	};

	async function isValid({ formData, submitter }) {
		let db = new DBAdapter();
		let { fileResponse, buffer } = fileField.getBufferAndResponse();
		let filExt = fileResponse?.path.split('.').pop();
		if (prescription) {
			let updatedPrescription = {
				prescription_id,
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
			await db.update(
				'prescriptions',
				[['prescription_id', prescription.prescription_id]],
				updatedPrescription
			);
			await saveFile(filExt, buffer);
			patients.update((p) => {
				let rprescription = p
					.find((p) => p.patient_id === patient.patient_id)
					.situations_pathologiques.find((sp) => sp.sp_id === sp.sp_id)
					.prescriptions.find((p) => p.prescription_id === prescription.prescription_id);
				rprescription.date = date;
				rprescription.jointe_a = jointe_a;
				rprescription.nombre_seance = nombre_seance;
				rprescription.seance_par_semaine = seance_par_semaine;
				rprescription.prescripteur = JSON.parse(updatedPrescription.prescripteur);
				rprescription.file_name = filExt;
				return p;
			});
			goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id);
			return;
		}

		let newPrescription = {
			user_id: get(user).user.id,
			prescription_id,
			created_at: dayjs().format('YYYY-MM-DD'),
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
		await db.save('prescriptions', newPrescription);
		newPrescription.prescripteur = JSON.parse(newPrescription.prescripteur);
		patients.update((patients) => {
			let rpatient = patients.find((p) => p.patient_id == patient.patient_id);
			let tsp = rpatient.situations_pathologiques.find((bsp) => bsp.sp_id == sp.sp_id);
			tsp.prescriptions.push(newPrescription);
			return patients;
		});
		if (filExt && buffer) {
			await saveFile(filExt, buffer);
		}
		goto('/dashboard/patients/' + patient.patient_id + '/situation-pathologique/' + sp.sp_id);
	}
	async function saveFile(filExt, buffer) {
		let dirPath = await appLocalDataDir();
		await invoke('setup_path', {
			dirPath: `${dirPath}/${get(user).user.id}/${patient.nom}-${patient.prenom}(${
				patient.patient_id
			})/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions`,
			fileName: `${prescripteurNom}-${prescripteurPrenom}-${date}(${prescription_id}).${filExt}`,
			fileContent: Array.from(buffer)
		});
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
			? `/${get(user).user.id}/${patient.nom}-${patient.prenom}(${
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
