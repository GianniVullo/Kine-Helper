// import {patients} from '$lib/stores/patientStore';
// import { get } from 'svelte/store';

// /** @type {import('./$types').LayoutLoad} */
// export async function load({ params }) {
// 	let patient = patients.getPatient(params.patientId);
// 	if (patient.situations_pathologiques.length == 0) {
// 		await patients.getLastSpAndOthers(patient.patient_id);
// 	}

// 	return {patient};
// }
