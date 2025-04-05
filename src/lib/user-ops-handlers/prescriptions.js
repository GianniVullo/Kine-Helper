import { UserOperationsHandler } from './abstractHandler';
import { file_exists, remove_file, save_to_disk, open_file } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';
import { trace } from '@tauri-apps/plugin-log';
import { page } from '$app/state';

//* ça a l'air con mtn mais je suis sûr que ça va payer à un moment
function setupPrescriptionOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function updatePrescription(data, file) {
	// TODO 1 : Il faut enregistrer le filename en fait car il faut pouvoir supprimer l'ancienne prescription même si l'extension de fichier n'est pas le même.
	// TODO 2 Implement the saveFile with supabase API
	//* comme c'est update, il n'y a pas besoin de changer l'image si elle n'a pas été transformée
	if (file) {
		console.log('there is a file');

		const filePath = prescriptionPath();
		const fileName = `${data.prescription_id}.${file.name.split('.').pop()}`;

		if (data.file_name) {
			let delError = await remove_file(filePath + '/' + data.file_name, { recursive: true });
			if (delError) {
				return { error: delError };
			}
			data.file_name = fileName;
		}
		let fsError = await save_to_disk(filePath, fileName, Array.from(await file.bytes()));
		console.log('ERRor! ', fsError);

		if (fsError) {
			return { data, error: fsError };
		}
		data.file_name = fileName;
	}
	const { error } = await appState.db.update(
		'prescriptions',
		[
			['prescription_id', data.prescription_id],
			['user_id', appState.user.id]
		],
		data
	);
	if (error) {
		return { error };
	}
	return { error: null };
}

export async function createPrescription(data, file) {
	trace('in createPrescription');
	if (data.file_name) {
		delete data.file_name;
	}

	let file_name;
	if (file) {
		const fileExtension = file.name.split('.').pop();
		file_name = `${data.prescription_id}.${fileExtension}`;
		const filePath = prescriptionPath();
		data.prescripteur = JSON.stringify(data.prescripteur);
		let fsError = await save_to_disk(filePath, file_name, Array.from(await file.bytes()));
		data.file_name = fileExtension;
		delete data.file;
		if (fsError) {
			return { data: prescription, error: fsError };
		}
	}
	const { data: prescription, error } = await appState.db.insert('prescriptions', data);
	if (error) {
		return { data: null, error };
	}
	return { data: prescription, error: null };
}

export async function deletePrescription(prescription) {
	let { data, error } = await appState.db.delete('prescriptions', [
		['prescription_id', prescription.prescription_id]
	]);
	if (error) {
		console.log(error);

		return { data: null, error };
	}
	const filePath = prescriptionPath();
	let file_name = prescription.file_name;
	const completePath = `${filePath}/${file_name}`;
	if (file_name) {
		if (await file_exists(completePath)) {
			let fserror = await remove_file(completePath, { recursive: false });
			if (fserror) {
				console.log(fserror);

				return { data: null, error: fserror };
			}
		}
	}
	return { data, error: error };
}

export async function openPrescription(prescription) {
	let path = prescriptionPath();
	const completePath = `${path}/${prescription.prescription_id}.${prescription.file_name}`;
	let exist = await file_exists(completePath);
	if (!exist) {
		return { error: 'File does not exist' };
	}
	let fsError = await open_file(completePath);
	if (fsError) {
		return { error: fsError };
	}
	return { data: null, error: null };
}

function prescriptionPath() {
	const { patient, sp } = page.data;
	return `${appState.user.id}/patient${
		patient.patient_id
	}/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions`;
}
