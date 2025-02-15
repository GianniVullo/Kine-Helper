import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
import { get } from 'svelte/store';
import { patients } from '../stores/PatientStore';
import { user } from '../stores/UserStore';
import { UserOperationsHandler } from './abstractHandler';
import { appState } from '../managers/AppState.svelte';
import { Patient, SituationPathologique } from './models';
import { info, trace } from '@tauri-apps/plugin-log';

//* ça a l'air con mtn mais je suis sûr que ça va payer à un moment
function setupPatientOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function createPatient(data) {
	const opsHandler = setupPatientOpsHandler();
	let result;
	await opsHandler.execute(async () => {
		trace('Creating new patient');
		await appState.db.save('patients', data);
		result = new Patient(data);
	});
	return result;
}

export async function retrievePatient(data) {
	const opsHandler = setupPatientOpsHandler();
	let p;
	await opsHandler.execute(async () => {
		let result = await appState.db.select('SELECT * from patients WHERE patient_id = $1', [
			data.patient_id
		]);
		console.log('Result of retrievePatient = ', result);

		if (result) {
			p = new Patient(result[0]);
			trace('Engaging SP summary fetch');
			let sps = (
				await appState.db.select('SELECT * from situations_pathologiques WHERE patient_id = $1', [
					data.patient_id
				])
			).map((sp) => new SituationPathologique(sp));

			p.situations_pathologiques = sps;
			info("Patient + SP's successfully fetched returning in load fonction");
		}
		console.log('P = ', p);
	});
	return p;
}

export async function updatePatient(data) {
	const opsHandler = setupPatientOpsHandler();
	await opsHandler.execute(async () => {
		trace('Updating Patient');
		await appState.db.update(
			'patients',
			[
				['user_id', appState.user.id],
				['patient_id', data.patient_id]
			],
			data
		);
		trace('Patient Updated');
	});
}

export async function deletePatient(data) {
	const opsHandler = setupPatientOpsHandler();
	await opsHandler.execute(async () => {
		trace('deleting patient');
		await appState.db.delete('patients', [
			['patient_id', data.patient_id],
			['user_id', appState.user.id]
		]);

		patients.update((p) => p.filter((p) => p.patient_id !== data.patient_id));
	});
}

export async function listPatients(data) {
	const opsHandler = setupPatientOpsHandler();
	let patients;
	await opsHandler.execute(async () => {
		console.log(appState);

		const { data: patientList } = await appState.db.list(
			'patients',
			[
				['user_id', data.id],
				['actif', appState.profil?.offre === 'cloud' ? true : 1]
			],
			{
				selectStatement: '*'
				// orderBy: 'nom' Not needed I think
			}
		);
		patientList.sort((a, b) => {
			if (a.nom > b.nom) {
				return 1;
			} else {
				return -1;
			}
		});
		let transformed = patientList.map((p) => new Patient(p));
		// console.log('Les patients transformed', transformed);
		// patients.set(transformed);
		patients = transformed;
	});
	return patients;
}
