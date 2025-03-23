import { retrievePatient } from '../../../../lib/user-ops-handlers/patients';
import { appState } from '../../../../lib/managers/AppState.svelte.js';
import { trace } from '@tauri-apps/plugin-log';
import { retrieveSituationPathologique } from '../../../../lib/user-ops-handlers/situations_pathologiques.js';
import { error as errorKit } from '@sveltejs/kit';

export async function load({ params, depends }) {
	depends('patient:layout');
	trace('Entering load function, engaging patient retrival');
	await appState.init({});
	let { data: patient, error } = await retrievePatient({ patient_id: params.patientId });
	if (error) {
		errorKit(500, { message: error.message });
	}
	if (!patient) {
		patient = 'none';
	}

	let sp;
	if (params.spId) {
		const { data, error } = await retrieveSituationPathologique({ sp_id: params.spId });
		if (error) {
			errorKit(500, { message: error.message });
		}
		sp = data;
		if (!sp) {
			sp = 'none';
		}
	}

	return { patient, sp };
}
