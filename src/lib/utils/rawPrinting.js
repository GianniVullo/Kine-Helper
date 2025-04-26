import { appState } from '../managers/AppState.svelte';
import { invoke } from '@tauri-apps/api/core';
export async function printAttestation(lines, attestation) {
	const { patient, prescription, situation_pathologique, imprimante, error } =
		await getData(attestation);

	if (!lines) {
		const { data: seances, error: seancesError } = await appState.db.select(
			`SELECT seances.date, codes.code_reference 
			FROM seances 
			LEFT JOIN codes ON codes.code_id = seances.code_id 
			WHERE seances.attestation_id = $1`,
			[attestation.attestation_id]
		);
		lines = seances
		console.log('seances', seances);
		if (seancesError) {
			return { error: seancesError };
		}
		console.log('lines', lines);
		
	}
	console.log(
		'printAttestation with lines, attestation, patient, prescription, situation_pathologique, imprimante :',
		lines,
		attestation,
		patient,
		prescription,
		situation_pathologique,
		imprimante,
		error
	);
	if (error) {
		return { error };
	}
	let formData = {
		is_nine_pin: imprimante.metadata.is_nine_pin,
		patient: {
			nom: patient.nom,
			prenom: patient.prenom,
			mutualite: `${patient.mutualite}`,
			niss: patient.niss,
			adresse: patient.adresse,
			cp: `${patient.cp}`,
			localite: patient.localite
		},
		prescription: {
			prescripteur:
				typeof prescription.prescripteur === 'string'
					? JSON.parse(prescription.prescripteur)
					: prescription.prescripteur,
			date: prescription.date,
			jointe_a: attestation.porte_prescr ? '' : prescription.jointe_a
		},
		attestation: {
			porte_prescr: attestation.porte_prescr,
			date: attestation.date,
			seances: lines,
			total_recu: attestation.total_recu
		},
		kine: {
			nom: appState.user.nom,
			prenom: appState.user.prenom,
			inami: appState.user.inami,
			adresse: appState.user.adresse,
			cp: `${appState.user.cp}`,
			localite: appState.user.localite,
			numero_bce: appState.user.bce
		},
		situation_pathologique: {
			numero_etablissement:
				attestation.numero_etablissement ?? situation_pathologique.numero_etablissement ?? '',
			service: attestation.service ?? situation_pathologique.service ?? ''
		}
	};
	console.log('formData in RawPrinter ==', formData);
	return await invoke('print_attestation', { printerName: imprimante.name, formData });
	return { error: null };
}

async function getData(attestation) {
	const { data: patientArray, error: patientError } = await appState.db.select(
		'SELECT * FROM patients WHERE patient_id = $1',
		[attestation.patient_id]
	);
	if (patientError) {
		return { error: patientError };
	}
	const patient = patientArray[0];
	const { data: prescriptionArray, error: prescrError } = await appState.db.select(
		'SELECT * FROM prescriptions WHERE prescription_id = $1',
		[attestation.prescription_id]
	);
	if (prescrError) {
		return { error: prescrError };
	}
	const prescription = prescriptionArray[0];
	const { data: situation_pathologiqueArray, error: spError } = await appState.db.select(
		'SELECT * FROM situations_pathologiques WHERE sp_id = $1',
		[attestation.sp_id]
	);
	if (spError) {
		return { error: spError };
	}
	const situation_pathologique = situation_pathologiqueArray[0];
	const { data: imprimante, error: NoPrinter } = await appState.db.getRawPrinter();
	if (NoPrinter) {
		return { error: NoPrinter };
	}

	return { patient, prescription, situation_pathologique, imprimante };
}
