import { appState } from '../managers/AppState.svelte';
import { FacturePatient } from '../pdfs/facturePatient';
import { FactureMutuelle } from '../pdfs/factureMutuelle';

export async function getFacturePatientPDFHandler(facture) {
	let { patient, sp, error, codes, attestations } = await getData(facture);
	if (error) {
		return { error };
	}
	return { facture: new FacturePatient(facture, patient, sp, codes, attestations) };
}

export async function getFactureMutuellePDFHandler(facture) {
	let { patient, sp, error } = await getpsp(facture);
	if (error) {
		return { error };
	}
	return { facture: new FactureMutuelle(facture, patient, sp, codes, attestations) };
}

export async function createDocument(data) {}

export async function editDocument(data) {}

export async function deleteDocument(data) {}

export async function listDocuments(data) {}

export async function retrieveDocument(params) {}

async function getpsp(facture) {
	let { data: patientArray, error: patientError } = await appState.db.select(
		'SELECT * FROM patients WHERE patient_id = $1',
		[facture.patient_id]
	);
	if (patientError) {
		return { error: patientError };
	}
	let patient = patientArray[0];
	let { data: spArray, error: spError } = await appState.db.select(
		'SELECT * FROM situations_pathologiques WHERE sp_id = $1',
		[facture.sp_id]
	);
	if (spError) {
		return { error: spError };
	}
	let sp = spArray[0];
	return { patient, sp, error: null };
}
async function getData(facture) {
	const { patient, sp, error } = await getpsp(facture);
	if (error) {
		return { error };
	}
	const { data: attestations, error: attestationsError } = await appState.db.select(
		`SELECT a.*
            FROM attestations a
        JOIN factures_attestations fa ON a.attestation_id = fa.attestation_id
        WHERE fa.facture_id = $1;`,
		[facture.facture_id]
	);
	if (attestationsError) {
		return { error: attestationsError };
	}
	const { data: codes, error: codesError } = await appState.db.select(
		`SELECT DISTINCT s.code_id
            FROM seances s
            JOIN factures_attestations fa ON s.attestation_id = fa.attestation_id
        WHERE fa.facture_id = $1;`,
		[facture.facture_id]
	);
	if (codesError) {
		return { error: codesError };
	}
	return { patient, sp, attestations, codes, error: null };
}
