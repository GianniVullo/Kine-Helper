import { retrievePatient } from '../../../../lib/user-ops-handlers/patients';
import { appState } from '../../../../lib/managers/AppState.svelte.js';
import { trace } from '@tauri-apps/plugin-log';
import { retrieveSituationPathologique } from '../../../../lib/user-ops-handlers/situations_pathologiques.js';

export async function load({ params, depends }) {
	depends('patient:layout');
	trace('Entering load function, engaging patient retrival');
	await appState.init({});
	let patient = await retrievePatient({ patient_id: params.patientId });
	if (!patient) {
		patient = 'none';
	}

	let sp;
	if (params.spId) {
		sp = await retrieveSituationPathologique({ sp_id: params.spId });
		if (!sp) {
			sp = 'none';
		}
	}

	return { patient, sp };
}
