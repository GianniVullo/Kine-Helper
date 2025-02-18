import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
import { get } from 'svelte/store';
import { patients } from '../stores/PatientStore';
import { user } from '../stores/UserStore';
import { UserOperationsHandler } from './abstractHandler';
import { file_exists, remove_file, save_to_disk } from '../utils/fsAccessor';
import { appState } from '../managers/AppState.svelte';
import { trace } from '@tauri-apps/plugin-log';

//* ça a l'air con mtn mais je suis sûr que ça va payer à un moment
function setupPrescriptionOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function updatePrescription(data) {
	const opsHandler = setupPrescriptionOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		await db.update(
			'prescriptions',
			[
				['prescription_id', data.prescription.prescription_id],
				['user_id', get(user).user.id]
			],
			data.prescription
		);
		// TODO Implement the saveFile with supabase API
		if (data.fileResponse) {
			//* comme c'est update, il n'y a pas besoin de changer l'image si elle n'a pas été transformée
			await data.saveFile(data.filExt, data.buffer);
		}
		patients.update((p) => {
			let rprescription = p
				.find((p) => p.patient_id === data.prescription.patient.patient_id)
				.situations_pathologiques.find((sp) => sp.sp_id === data.prescription.sp_id)
				.prescriptions.find((p) => p.prescription_id === data.prescription.prescription_id);
			rprescription.date = data.prescription.date;
			rprescription.jointe_a = data.prescription.jointe_a;
			rprescription.nombre_seance = data.prescription.nombre_seance;
			rprescription.seance_par_semaine = data.prescription.seance_par_semaine;
			rprescription.prescripteur = JSON.parse(data.prescription.prescripteur);
			rprescription.file_name = data.prescription.file_name;
			return p;
		});
	});
}

export async function createPrescription(data) {
	const opsHandler = setupPrescriptionOpsHandler();
	await opsHandler.execute(async () => {
		trace('in createPrescription');
		data.prescription.prescripteur = JSON.stringify(data.prescription.prescripteur);
		await appState.db.insert('prescriptions', data.prescription);
		if (data.buffer) {
			await save_to_disk(data.filePath, data.fileName, Array.from(data.buffer));
		}
	});
}

export async function deletePrescription(prescription) {
	const opsHandler = setupPrescriptionOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		await db.delete('prescriptions', [
			['prescription_id', prescription.prescription_id],
			['user_id', get(user).user.id]
		]);
		patients.update((ps) => {
			let p = ps.find((p) => p.patient_id === patient.patient_id);
			let sp = p.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
			sp.prescriptions = sp.prescriptions.filter(
				(p) => p.prescription_id !== prescription.prescription_id
			);
			return ps;
		});
		let path = await prescriptionPath(prescription);
		if (await file_exists(path)) {
			await remove_file(path);
		}
	});
}
