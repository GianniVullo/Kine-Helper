import { UserOperationsHandler } from './abstractHandler';
import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
import { get } from 'svelte/store';
import { patients } from '../stores/PatientStore';
import { user } from '../stores/UserStore';
import { appState } from '../managers/AppState.svelte';
import { printAttestation } from '../utils/rawPrinting';
import { FacturePatient } from '../pdfs/facturePatient';
import { getFactureMutuellePDFHandler, getFacturePatientPDFHandler } from './documents';

function setupAttestationOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	return opsHandler;
}

export async function createAttestation(data) {
	/**
	 ** Il faut :
	 ** 	- Créer une attestation
	 ** 	- Mettre à jour la prescription.jointe_a si attestation.porte_prescr
	 ** 	- Mettre à jour les séances (has_been_attested)
	 ** 	- Créer une facture si nécessaire
	 ** 	- Imprimer l'attestation et/ou la facture
	 */

	// Création de l'attestation
	console.log('createAttestation', data);
	let { data: attestation, error: attestationError } = await appState.db.insert(
		'attestations',
		data.attestation
	);

	console.log('attestation', attestation);
	if (attestationError) {
		return { error: attestationError };
	}

	// Mise à jour de la prescription
	if (data.attestation.porte_prescr) {
		let { data: prescription, error: prescriptionError } = await appState.db.update(
			'prescriptions',
			[['prescription_id', data.attestation.prescription_id]],
			{ jointe_a: data.attestation.date }
		);
		console.log('prescription', prescription);
		if (prescriptionError) {
			return { error: prescriptionError };
		}
	}

	// Mise à jour des séances
	let seanceCodeMap = data.seances.reduce((seanceMap, s) => {
		console.log('seanceMap', seanceMap);
		console.log('s', s);
		if (!seanceMap[s.code_id]) seanceMap[s.code_id] = [];
		seanceMap[s.code_id].push(s.seance_id);
		return seanceMap;
	}, {});
	console.log('seanceCodeMap', seanceCodeMap);
	let caseStatements = Object.entries(seanceCodeMap)
		.map(([code, seanceIds]) => `WHEN seance_id IN ('${seanceIds.join("', '")}') THEN '${code}'`)
		.join('\n');

	console.log('caseStatements', caseStatements);

	let sqlQuery = `
		UPDATE seances
			SET 
			attestation_id = $1,
			has_been_attested = true,
			code_id = CASE 
				${caseStatements}
				END
		WHERE seance_id IN ('${data.seances.map((s) => s.seance_id).join("', '")}');`;

	console.log(sqlQuery);
	let { data: seances, error: seancesError } = await appState.db.execute(sqlQuery, [
		data.attestation.attestation_id
	]);
	if (seancesError) {
		return { error: seancesError };
	}
	console.log('seances', seances);

	// Génération des fatcures
	if (data.generateFacturePatient) {
		let { data: facturePatient, error: facturePatientError } = await appState.db.insert(
			'factures',
			data.facturePatient
		);
		if (facturePatientError) {
			return { error: facturePatientError };
		}
		console.log('facturePatient', facturePatient);
	}
	if (data.generateFactureMutuelle) {
		let { data: factureMutuelle, error: factureMutuelleError } = await appState.db.insert(
			'factures',
			data.factureMutuelle
		);
		if (factureMutuelleError) {
			return { error: factureMutuelleError };
		}
		console.log('factureMutuelle', factureMutuelle);
	}

	// impression des faactures et attestation
	if (data.has_been_printed) {
		const { error } = await printAttestation(data.lines, data.attestation);
	}
	if (data.printFacturePatient) {
		// TODO : implement PDF printing
		const { facture: facturePatient, error: facturePatientError } =
			await getFacturePatientPDFHandler(data.facturePatient);
		if (facturePatientError) {
			return { error: facturePatientError };
		}
		facturePatient.open();
	}
	if (data.printFactureMutuelle) {
		// TODO : implement PDF printing
		const { facture: factureMutuelle, error: factureMutuelleError } =
			await getFactureMutuellePDFHandler(data.factureMutuelle);
		if (factureMutuelleError) {
			return { error: factureMutuelleError };
		}
		fact;
	}
}

// TODO : absolutely not functional
export async function getCodes(data) {
	const opsHandler = setupAttestationOpsHandler();
	opsHandler.execute(async () => {
		let { data, error } = await appState.db.select('SELECT * FROM codes WHERE code_id = $1', [
			code_id
		]);
	});
}

export async function updateAttestation(data) {
	const opsHandler = setupAttestationOpsHandler();
	opsHandler.execute(async () => {
		const db = new DBAdapter();
		await db.update(
			'attestations',
			[
				['user_id', get(user).user.id],
				['patient_id', data.patient_id],
				['attestation_id', data.attestation_id]
			],
			data
		);
		patients.update((p) => {
			const rpatient = p.find((p) => p.patient_id === data.patient_id);
			const rsp = rpatient.situations_pathologiques.find((lsp) => lsp.sp_id === data.sp_id);
			let attest = rsp.attestations.find((a) => a.attestation_id === data.attestation_id);
			attest.mutuelle_paid = data.mutuelle_paid;
			attest.patient_paid = data.patient_paid;
			attest.total_recu = data.total_recu;
			attest.valeur_totale = data.valeur_totale;
			return p;
		});
	});
}

export async function deleteAttestation(data) {}

export async function markAsPaid(attestation_id, factureType) {
	const { data: attestation, error: attestationError } = await appState.db.execute(
		`
		UPDATE attestations
		SET ${factureType}_paid = true
		WHERE attestation_id = $1
	`,
		[attestation_id]
	);
	if (attestationError) {
		return { error: attestationError };
	}
}
