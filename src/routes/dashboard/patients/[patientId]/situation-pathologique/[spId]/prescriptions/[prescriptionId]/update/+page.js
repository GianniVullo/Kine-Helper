import { appState } from '../../../../../../../../../lib/managers/AppState.svelte';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	let { data: prescription, error } = await appState.db.select(
		'SELECT * FROM prescriptions WHERE prescription_id = $1',
		[params.prescriptionId]
	);
	if (error) {
		error(500, { message: error });
	}
	prescription = prescription[0];
	if (prescription.prescripteur) {
		prescription.prescripteur = JSON.parse(prescription.prescripteur);
		prescription.prescripteurNom = prescription.prescripteur.nom;
		prescription.prescripteurPrenom = prescription.prescripteur.prenom;
		prescription.prescripteurInami = prescription.prescripteur.inami;
		delete prescription.prescripteur;
	}

	return {
		prescription
	};
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [
		{
			patientId: 'test-patient',
			spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2',
			prescriptionId: '14a74ea8-9fb6-4f5b-acee-7bf09bed5285'
		}
	];
}
