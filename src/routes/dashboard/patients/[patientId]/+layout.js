import { appState } from '../../../../lib/managers/AppState.svelte.js';
import { trace } from '@tauri-apps/plugin-log';
import { error as errorKit } from '@sveltejs/kit';

export async function load({ params, depends }) {
	depends('patient:layout');
	trace('Entering load function, engaging patient retrival');
	await appState.init({});
	// db.retrievePatient tries to retrieve the patient and its related situations pathologiques from the local database and if it is not found, it will try to fetch it from Supabase.
	let { data: patient, error } = await appState.db.retrievePatient(params.patientId);
	if (error) {
		errorKit(500, { message: error.message });
	}
	if (!patient) {
		patient = 'none';
	}
	let sp;
	if (params.spId) {
		const { data, error } = await appState.db.retrieve_sp({ sp_id: params.spId });
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
