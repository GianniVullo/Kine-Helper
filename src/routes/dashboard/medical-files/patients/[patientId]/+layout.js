import { patients } from '$lib/stores/PatientStore';

/** @type {import('./$types').LayoutLoad} */
export async function load({params}) {
	let retrievedPatients;
	patients.subscribe((v) => (retrievedPatients = v));
	console.log(retrievedPatients, params);
	return retrievedPatients.find((pat) => pat.patient_id == params.patientId);
}
