import { appState } from '../managers/AppState.svelte';
import { Patient, SituationPathologique } from './models';
import { info, trace } from '@tauri-apps/plugin-log';

export async function retrievePatient(data) {
	let { data: result, error } = await appState.db.select(
		'SELECT * from patients WHERE patient_id = $1',
		[data.patient_id]
	);
	if (error) {
		return { data: null, error };
	}
	console.log('Result of retrievePatient = ', result);

	if (result) {
		result = new Patient(result[0]);
		trace('Engaging SP summary fetch');
		let { data: spResult, error: spError } = await appState.db.select(
			'SELECT * from situations_pathologiques WHERE patient_id = $1',
			[data.patient_id]
		);
		if (spError) {
			return { data: result, error: spError };
		}
		spResult = spResult.map((sp) => new SituationPathologique(sp));

		result.situations_pathologiques = spResult;
		info("Patient + SP's successfully fetched returning in load fonction");
	}
	return { data: result, error: null };
}

export async function deletePatient(data) {
	trace('deleting patient');
	const { error } = await appState.db.delete('patients', [['patient_id', data.patient_id]]);
	return { error };
}

export async function listPatients(data) {
	const { data: patientList, error } = await appState.db.list(
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
	if (error) {
		return { data: null, error };
	}
	patientList.sort((a, b) => {
		if (a.nom > b.nom) {
			return 1;
		} else {
			return -1;
		}
	});
	let transformed = patientList.map((p) => new Patient(p));
	return { data: transformed, error: null };
}
