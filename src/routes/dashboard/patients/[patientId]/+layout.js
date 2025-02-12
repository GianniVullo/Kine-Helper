import { retrievePatient } from '../../../../lib/user-ops-handlers/patients';
import { patientState } from '../../../../lib/managers/PatientCache.svelte.js';
import { appState } from '../../../../lib/managers/AppState.svelte.js';

export async function load({ params }) {
	console.log('LES PARAMS', params);
	let patient = await retrievePatient({ patient_id: params.patientId });
	patientState.patient = patient;
	console.log('LE PATIENT', patient);

	return { patient };
}
