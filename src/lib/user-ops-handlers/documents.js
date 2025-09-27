import { appState } from '../managers/AppState.svelte';
import { FacturePatient } from '../pdfs/facturePatient';
import { FactureMutuelle } from '../pdfs/factureMutuelle';
import { indmeniteCategory } from '../stores/codeDetails';
import { AnnexeA } from '../pdfs/annexeA';
import { AnnexeB } from '../pdfs/annexeB';
import { info } from '../cloud/libraries/logging';

export async function getAccordPDF(accord) {
	console.log('in getAccordPDF with accord :', accord);
	const { patient, sp, error } = await getpsp(accord);
	if (error) {
		return { error };
	}
	if (accord.metadata.doc === 'A') {
		return { accord: new AnnexeA(accord, patient, sp, accord) };
	} else if (accord.metadata.doc === 'B') {
		return { accord: new AnnexeB(accord, patient, sp, accord) };
	}
	return { error: 'Invalid document type' };
}

export async function getFacturePDF(facture) {
	console.log('in getFacturePDF with facture :', facture);
	if (facture.type === 'patient') {
		return await getFacturePatientPDFHandler(facture);
	} else {
		return await getFactureMutuellePDFHandler(facture);
	}
}

export async function getFacturePatientPDFHandler(facture) {
	let { patient, sp, error, codes, attestations } = await getData(facture);
	console.log(
		'Instantiating FacturePatient with facture, patient, sp, codes, attestations :',
		facture,
		patient,
		sp,
		codes,
		attestations,
		error
	);
	if (error) {
		return { error };
	}
	const factureHandler = new FacturePatient(facture, patient, sp, codes, attestations);
	console.log('factureHandler', factureHandler);
	return { facture: factureHandler };
}

export async function getFactureMutuellePDFHandler(facture) {
	let { patient, sp, error, codes, attestations } = await getData(facture);
	if (error) {
		console.log('error', error);
		return { error };
	}
	console.log(
		'Instantiating FactureMutuelle with facture, patient, sp, codes, attestations :',
		facture,
		patient,
		sp,
		codes,
		attestations
	);
	const factureHandler = new FactureMutuelle(facture, patient, sp, codes, attestations);
	console.log('factureHandler', factureHandler);
	// Calculer les lignes des attestations
	return { facture: factureHandler };
}

export async function createFacture(data, attestation_ids, produce_pdf = true) {
	console.log('in createFacture with data, attestation_ids :', data, attestation_ids);
	/**
	 ** - Enregistrer une facture
	 ** - Lier les attestations à la facture
	 ** - Produire un PDF
	 */

	// facture creation
	let { data: facture, error: factureError } = await appState.db.insert('factures', data);
	if (factureError) {
		return { error: factureError };
	}
	console.log('facture', facture);

	// attestation linking
	for (const attestation_id of attestation_ids) {
		let { data: factureAttestation, error: factureAttestationError } = await appState.db.insert(
			'factures_attestations',
			{
				facture_id: data.id,
				attestation_id,
				user_id: appState.user.id,
				organization_id: appState.selectedOrg.id
			}
		);
		if (factureAttestationError) {
			return { error: factureAttestationError };
		}
		console.log('factureAttestation', factureAttestation);
	}

	// pdf production
	if (produce_pdf) {
		const { facture: facturePDF, error: facturePDFError } = await getFacturePDF(data);
		if (facturePDFError) {
			return { error: facturePDFError };
		}
		try {
			await facturePDF.open();
		} catch (error) {
			console.warn('ERR While trying to ope facture pdf', error);
		}
		console.log('FACTURE OPENED');
	}
	return { data: 'OK' };
}

export async function editDocument(data) {}

export async function deleteFacture(data) {
	// Delete le pdf
	const { facture } = await getFacturePDF(data);
	console.log('facturePDF', facture);
	const { error } = await facture.delete();
	if (error) {
		return { error };
	}

	// Delete l'obj de la db
	const { data: factureStatus, error: factureError } = await appState.db.execute(
		'Delete FROM factures WHERE id = $1;',
		[data.id]
	);
	if (factureError) {
		return { error: factureError };
	}

	// Delete les relations avec les attestations
	const { data: deleteRes, error: deleteError } = await appState.db.execute(
		'DELETE FROM factures_attestations WHERE facture_id = $1;',
		[data.id]
	);
	if (deleteError) {
		return { error: deleteError };
	}
}

export async function deleteAccord(data) {
	// Delete le pdf
	const { accord, errorInstantiatingPDF } = await getAccordPDF(data);
	if (errorInstantiatingPDF) {
		return { error: errorInstantiatingPDF };
	}
	console.log('accordPDF', accord);
	const { error } = await accord.delete();
	if (error) {
		return { error };
	}

	// Delete l'obj de la db
	const { data: accordDeleteStatus, error: factureError } = await appState.db.execute(
		'Delete FROM accords WHERE id = $1;',
		[data.id]
	);
	if (factureError) {
		return { error: factureError };
	}
	console.log('accordDeleteStatus', accordDeleteStatus);
}

export async function listDocuments(data) {}

export async function retrieveDocument(params) {}

async function getpsp(facture) {
	info('THE FACTURE OBJ IN getPSP', facture);
	let { data: patientArray, error: patientError } = await appState.db.select(
		'SELECT * FROM patients WHERE patient_id = $1',
		[facture.patient_id]
	);
	if (patientError) {
		return { error: patientError };
	}
	let patient = patientArray[0];
	console.log('patient IN getPSP', patient);
	let { data: sp, error: spError } = await appState.db.retrieve_sp(facture);
	if (spError) {
		return { error: spError };
	}
	console.log('sp IN getPSP', sp);
	return { patient, sp, error: null };
}
async function getData(facture) {
	console.log('facture', facture);
	const { patient, sp, error } = await getpsp(facture);
	if (error) {
		return { error };
	}
	const { data: attestations, error: attestationsError } = await retrieveFactureAttestions(facture);
	if (attestationsError) {
		return { error: attestationsError };
	}
	console.log('attestations in getData', attestations);

	const { data: code_ids, error: codesError } = await appState.db.select(
		`SELECT DISTINCT s.code_id
            FROM seances s
            JOIN factures_attestations fa ON s.attestation_id = fa.attestation_id
        WHERE fa.facture_id = $1;`,
		[facture.id]
	);
	console.log('code_ids', code_ids);
	const { data: pseudoState, error: pseudoError } = await appState.db.select(
		`SELECT s.metadata, s.indemnite, s.rapport_ecrit
            FROM seances s
            JOIN factures_attestations fa ON s.attestation_id = fa.attestation_id
        WHERE fa.facture_id = $1;`,
		[facture.id]
	);
	pseudoState.map((s) => {
		typeof s.metadata === 'string' && (s.metadata = JSON.parse(s.metadata));
		typeof s.indemnite === 'string' && (s.indemnite = JSON.parse(s.indemnite));
		typeof s.rapport_ecrit === 'string' && (s.rapport_ecrit = JSON.parse(s.rapport_ecrit));
	});
	console.log('pseudoState', pseudoState);
	if (codesError) {
		return { error: codesError };
	}
	let codes = new Map();
	for (const { code_id } of code_ids) {
		const { data: code, error: codeError } = await appState.db.select(
			'SELECT * FROM codes WHERE code_id = $1',
			[code_id]
		);
		// pseudocodes
		if (codeError) {
			return { error: codeError };
		}
		codes.set(code[0].code_id, code[0]);
	}
	let pseudoCodeQuery =
		'SELECT * FROM codes WHERE groupe = $1 AND lieu = $2 AND lourde_type = $3 AND duree = $4 AND convention_id = $5 AND type = $6';
	const firstCode = codes.get(code_ids[0].code_id);
	console.log('codes', codes);
	console.log('firstCode', firstCode);
	let pseudoCodeQueryArgs = [
		firstCode.groupe,
		firstCode.lieu,
		firstCode.lourde_type,
		firstCode.duree,
		firstCode.convention_id
	];
	if (pseudoState.some((s) => s.metadata?.intake)) {
		const { data: intakes, error: intakeError } = await appState.db.select(
			'SELECT * FROM codes WHERE groupe = 0 AND lieu = $1 AND convention_id = $2 AND type = 6;',
			[firstCode.lieu, firstCode.convention_id, 6]
		);
		if (intakeError) {
			console.error('intakeError', intakeError);
			return { error: intakeError };
		}
		console.log('intakes', intakes);
		codes.set('intake', intakes[0]);
	}
	if (pseudoState.some((s) => s.rapport_ecrit)) {
		console.log('in rapport_ecrit with', pseudoCodeQueryArgs);
		pseudoCodeQuery =
			'SELECT * FROM codes WHERE groupe = $1 AND lieu = $2 AND convention_id = $3 AND type = $4';
		pseudoCodeQueryArgs[2] = null;
		pseudoCodeQueryArgs[3] = null;
		pseudoCodeQueryArgs.push(3);
		pseudoCodeQueryArgs = pseudoCodeQueryArgs.filter((arg) => arg !== null);
		const { data: rapports, error: rapportError } = await appState.db.select(
			pseudoCodeQuery,
			pseudoCodeQueryArgs
		);
		if (rapportError) {
			console.error('rapportError', rapportError);
			return { error: rapportError };
		}
		console.log('rapports', rapports);
		codes.set('rapport', rapports[0]);
	}
	if (pseudoState.some((s) => s.indemnite)) {
		const code_ref = indmeniteCategory[firstCode.groupe];
		console.log('code_ref', code_ref);
		const { data: indemniteCodes, error: indemniteError } = await appState.db.select(
			'SELECT * FROM codes WHERE convention_id = $1 AND code_reference = $2;',
			[firstCode.convention_id, code_ref]
		);
		if (indemniteError) {
			console.error('indemniteError', indemniteError);
			return { error: indemniteError };
		}
		console.log('indemniteCodes', indemniteCodes);
		codes.set('indemnite', indemniteCodes[0]);
	}
	console.log(
		'returning patient, sp, attestations, codes et error',
		patient,
		sp,
		attestations,
		codes,
		error
	);
	return { patient, sp, attestations, codes, error: null };
}

export async function retrieveFactureAttestions(facture) {
	console.log('facture', facture);
	const { data: attestations, error: attestationsError } = await appState.db.select(
		`SELECT a.*
            FROM attestations a
        JOIN factures_attestations fa ON a.attestation_id = fa.attestation_id
        WHERE fa.facture_id = $1;`,
		[facture.id]
	);
	if (attestationsError) {
		return { error: attestationsError };
	}
	return { data: attestations, error: null };
}
