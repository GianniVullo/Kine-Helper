import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
import { get } from 'svelte/store';
import { patients } from '../stores/PatientStore';
import { user } from '../stores/UserStore';
import { UserOperationsHandler } from './abstractHandler';
import { appState } from '../managers/AppState.svelte';
import { Patient, SituationPathologique } from './models';

//* ça a l'air con mtn mais je suis sûr que ça va payer à un moment
function setupPatientOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function createPatient(data) {
	const opsHandler = setupPatientOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		data.user_id = get(user).user.id;
		let result = await db.save('patients', data);
		console.log('result for dbAdatper action : ', result);
		let newPatient = new Patient(data);
		patients.update((ps) => {
			ps.push(newPatient);
			return ps;
		});
	});
}

export async function retrievePatient(data) {
	const opsHandler = setupPatientOpsHandler();
	await opsHandler.execute(async () => {
		appState
		let result = await appState.db.select('SELECT * from patients WHERE patient_id = $1', [
			data.patient_id
		]);
		console.log('result for dbAdatper action : ', result);
		if (result) {
			let p = new Patient(result);
			let sps = (
				await appState.db.select('SELECT * from situations_pathologiques WHERE patient_id = $1', [
					data
				])
			).map((sp) => new SituationPathologique(sp));
			console.log('THE SPS = ', sps);

			p.situations_pathologiques = sps;
			return p;
		}
		return;
	});
}

export async function updatePatient(data) {
	const opsHandler = setupPatientOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		let result = await db.update(
			'patients',
			[
				['user_id', get(user).user.id],
				['patient_id', data.patient_id]
			],
			data
		);
		console.log('The resulte of the update query = ', result);

		patients.update((ps) => {
			let rpatient = ps.find((p) => p.patient_id === data.patient_id);
			rpatient.nom = nom;
			rpatient.prenom = prenom;
			rpatient.niss = niss;
			rpatient.date_naissance = date_naissance;
			rpatient.sexe = sexe;
			rpatient.adresse = adresse;
			rpatient.cp = cp;
			rpatient.localite = localite;
			rpatient.num_affilie = num_affilie;
			rpatient.tiers_payant = tiers_payant;
			rpatient.ticket_moderateur = ticket_moderateur;
			rpatient.bim = bim;
			rpatient.mutualite = mutualite;
			rpatient.numero_etablissement = numero_etablissement;
			rpatient.service = service;
			rpatient.tel = tel;
			rpatient.gsm = gsm;
			rpatient.email = email;
			return ps;
		});
	});
}

export async function deletePatient(data) {
	const opsHandler = setupPatientOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		await db.delete('patients', [
			['patient_id', data.patient_id],
			['user_id', get(user).user.id]
		]);
		console.log('DONE the deletion');

		patients.update((p) => p.filter((p) => p.patient_id !== data.patient_id));
	});
}

export async function listPatients(data) {
	const opsHandler = setupPatientOpsHandler();
	let patients;
	await opsHandler.execute(async () => {
		console.log('in list patient operation handler with ', data);
		let db = new DBAdapter();
		const { data: patientList, error } = await db.list(
			'patients',
			[
				['user_id', data.id],
				['actif', get(user).profil?.offre === 'cloud' ? true : 1]
			],
			{
				selectStatement:
					get(user).profil?.offre === 'cloud' ? 'patient_id, actif, user_id, encrypted' : '*'
				// orderBy: 'nom' Not needed I think
			}
		);
		console.log('Les patients queried', patientList, error);
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
