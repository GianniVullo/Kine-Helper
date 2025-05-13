import { UserOperationsHandler } from './abstractHandler';
import { file_exists, remove_file, save_to_disk, open_file } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';
import { trace } from '@tauri-apps/plugin-log';
import { page } from '$app/state';
import { appLocalDataDir } from '@tauri-apps/api/path';

export async function updatePrescription(data, file) {
	// TODO 1 : Il faut enregistrer le filename en fait car il faut pouvoir supprimer l'ancienne prescription même si l'extension de fichier n'est pas le même.
	// TODO 2 Implement the saveFile with supabase API
	//* comme c'est update, il n'y a pas besoin de changer l'image si elle n'a pas été transformée
	if (file) {
		console.log('there is a file');

		const filePath = prescriptionPath();
		const fileExtension = file.name.split('.').pop();
		const fileName = `${data.prescription_id}.${fileExtension}`;

		if (data.file_name) {
			let delError = await remove_file(filePath + '/' + data.file_name, { recursive: true });
			if (delError) {
				return { error: delError };
			}
		}
		let fsError = await save_to_disk(filePath, fileName, Array.from(await file.bytes()));

		if (fsError) {
			console.log('ERRor! ', fsError);
			return { data, error: fsError };
		}
		data.file_name = { ext: fileExtension };
		delete data.file;
	}

	if (Array.isArray(data.froms) && data.froms.length > 0) {
		data.file_name = { ext: 'avif', n_p: data.froms.length };

		const applocaldataDir = await appLocalDataDir();
		const filePath = prescriptionPath();
		const fileName = `${data.prescription_id}.${file.name.split('.').pop()}`;

		console.log('the froms', data.froms);
		if (data.file_name) {
			let delError = await remove_file(filePath + '/' + data.file_name, { recursive: true });
			if (delError) {
				return { error: delError };
			}
			data.file_name = fileName;
		}

		for (const from of data.froms) {
			console.log('the from', from);
			await appState.queue.addToQueue({
				label: 'Compressing prescription scan',
				job: 'CompressAndSendPrescription',
				data: {
					file_path: `${applocaldataDir}/${prescriptionPath()}`,
					file_name: data.prescription_id + '.avif',
					from
				}
			});
		}
		delete data.file;
	}
	delete data.froms;

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
		data.file_name = { ext: fileExtension };
		delete data.file;
		if (fsError) {
			return { data: prescription, error: fsError };
		}
	}

	if (Array.isArray(data.froms)) {
		data.file_name = { ext: 'avif', n_p: data.froms.length };
		const applocaldataDir = await appLocalDataDir();
		console.log('the froms', data.froms);
		for (const from of data.froms) {
			console.log('the from', from);
			await appState.queue.addToQueue({
				label: 'Compressing prescription scan',
				job: 'CompressAndSendPrescription',
				data: {
					file_path: `${applocaldataDir}/${prescriptionPath()}`,
					file_name: data.prescription_id + '.avif',
					from
				}
			});
		}
		delete data.file;
	}
	delete data.froms;
	console.log('the data', data);

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
	if (typeof prescription.file_name === 'string') {
		prescription.file_name = JSON.parse(prescription.file_name);
	}
	console.log('the prescription', prescription);
	let path = prescriptionPath();
	const completePath = `${path}/${prescription.prescription_id}.${prescription.file_name.ext}`;
	console.log('the complete path', completePath);
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

export function prescriptionPath() {
	const { patient, sp } = page.data;
	return `${appState.user.id}/patient${
		patient.patient_id
	}/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions`;
}
