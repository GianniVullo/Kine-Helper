import { UserOperationsHandler } from './abstractHandler';
import { appState } from '../managers/AppState.svelte';
import { printAttestation } from '../utils/rawPrinting';
import { getFactureMutuellePDFHandler, getFacturePatientPDFHandler } from './documents';
import dayjs from 'dayjs';
import { groupSeanceInAttestations } from '../components/forms/utils/attestationUtils';

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
	 *TODO 	- Si la séance contient des tarifs avec un uuid, il faut hardcoder le tarif
	 ** 	- Créer une facture si nécessaire
	 ** 	- Créer le lien entre facture et attestation(s)
	 ** 	- Imprimer l'attestation et/ou la facture
	 ** 	- Mettre à jour la valeur de num_attestation dans le store
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

	// Il faut remplacer les tarifs et suppléments par une valeur "metadata.valeur_totale" qui additionne le prix de la séance + le prix des suppléments
	// cette addition doit être réalisée dans AttestationSchema et metadata doit être updaté ici
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
	for (const { metadata, seance_id } of data.seances) {
		let { data: metadataUpdateStatus, error: metadataUpdateError } = await appState.db.execute(
			"UPDATE seances SET metadata = json_insert(COALESCE(metadata, '{}'), '$.valeur_totale', $1) WHERE seance_id = $2",
			[metadata.valeur_totale, seance_id]
		);
		if (metadataUpdateError) {
			return { error: metadataUpdateError };
		}
		console.log('metadataUpdateStatus', metadataUpdateStatus);
	}
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
		let { data: factureAttestation, error: factureAttestationError } = await appState.db.insert(
			'factures_attestations',
			{
				facture_id: data.facturePatient.id,
				attestation_id: data.attestation.attestation_id
			}
		);
		console.log('factureAttestation', factureAttestation);
		if (factureAttestationError) {
			return { error: factureAttestationError };
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
		let { data: factureAttestation, error: factureAttestationError } = await appState.db.insert(
			'factures_attestations',
			{
				facture_id: data.factureMutuelle.id,
				attestation_id: data.attestation.attestation_id
			}
		);
		if (factureAttestationError) {
			return { error: factureAttestationError };
		}
		console.log('factureMutuelle', factureMutuelle);
	}

	// impression des faactures et attestation
	if (data.has_been_printed) {
		const { error } = await printAttestation(data.lines, data.attestation);
		// Mise à jour de num_attestation
		let { data: numero, error: storeError } = await appState.db.setItem(
			'num_attestation',
			parseInt(data.attestation.numero) + 1
		);
		console.log('numeroQueryResult', numero);

		if (storeError) {
			return { error: storeError };
		}
	}
	if (data.printFacturePatient) {
		// TODO : implement PDF printing
		const { facture: facturePatient, error: facturePatientError } =
			await getFacturePatientPDFHandler(data.facturePatient);
		if (facturePatientError) {
			return { error: facturePatientError };
		}
		// TODO Mettre la fonction print lorsque l'API sera prête
		facturePatient.open();
		// facturePatient.print();
	}
	if (data.printFactureMutuelle) {
		// TODO : implement PDF printing
		const { facture: factureMutuelle, error: factureMutuelleError } =
			await getFactureMutuellePDFHandler(data.factureMutuelle);
		if (factureMutuelleError) {
			return { error: factureMutuelleError };
		}
		// TODO Mettre la fonction print lorsque l'API sera prête
		factureMutuelle.open();
		// factureMutuelle.print();
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
		await appState.db.update(
			'attestations',
			[
				['user_id', appState.user.id],
				['patient_id', data.patient_id],
				['attestation_id', data.attestation_id]
			],
			data
		);
	});
}

export async function deleteAttestation(data) {}

export async function markAsPaid(data, factureType) {
	console.log('markAsPaid', data, factureType);
	const key = `${factureType}_paid`;
	const query = `
		UPDATE attestations
		SET ${key} = $1
		WHERE attestation_id = $2
	`;
	let { } = appState.db.update('attestations', [['attestation_id', data.attestation_id]], {
		[key]: !data[key]
	});
	console.log(query);
	const queryArgs = [!data[`${factureType}_paid`], data.attestation_id];
	console.log(queryArgs);
	const { data: attestation, error: attestationError } = await appState.db.execute(
		query,
		queryArgs
	);
	if (attestationError) {
		return { error: attestationError };
	}
}

export async function* attestationGenerator(sp, patient) {
	// D'abord il faut préparer les données
	// Il faut grouper les séances par prescription et par date. ensuite il faut itérer au travers de l'objet créé
	let seanceParPrescriptionEtDate = {};
	let attestationNumber = 0;
	const dates = sp.seances
		.filter((s) => !s.has_been_attested && !s.attestation_id && s.seance_type !== 3)
		.map((s) => new Date(s.date));

	const minDate = new Date(Math.min(...dates));
	const maxDate = new Date(Math.max(...dates));
	const { data: rows } = await appState.db.select(
		`SELECT
			c.convention_id,
			c.created_at,
			json_group_array(
				json_object(
				'code_id', codes.code_id,
				'code_reference', codes.code_reference,
				'groupe', codes.groupe,
				'type', codes.type,
				'duree', codes.duree,
				'lieu', codes.lieu,
				'amb_hos', codes.amb_hos,
				'lourde_type', codes.lourde_type,
				'drainage', codes.drainage,
				'honoraire', codes.honoraire,
				'coefficient', codes.coefficient,
				'remboursement', codes.remboursement,
				'valeur', codes.valeur
				)
			) AS codes
		FROM conventions c
		LEFT JOIN codes ON codes.convention_id = c.convention_id
		WHERE date(c.created_at) <= $1
		AND NOT EXISTS (
			SELECT 1 FROM conventions c2
			WHERE date(c2.created_at) > date(c.created_at)
			AND date(c2.created_at) <= $2
		)
		GROUP BY c.convention_id
		ORDER BY c.created_at DESC;`,
		[maxDate, minDate]
	);
	const conventions = rows.map((row) => ({
		convention_id: row.convention_id,
		created_at: row.created_at,
		codes: JSON.parse(row.codes)
	}));
	let numero = await appState.db.getItem('num_attestation');
	for (const seance of sp.seances) {
		if (seance.has_been_attested || seance.attestation_id) continue;
		if (seance.seance_type === 3) {
			// TODO Set the valeur
			await appState.db.update(`UPDATE seances SET has_been_attested = true WHERE id = $1;`, [
				seance.id
			]);
			continue;
		}
		let seance_category = `${seance.prescription_id}-${dayjs(seance.date).year()}`;
		if (!seanceParPrescriptionEtDate[seance_category]) {
			seanceParPrescriptionEtDate[seance_category] = [];
		}
		seanceParPrescriptionEtDate[seance_category].push(seance);
	}
	for (const [_, groupeDeSeance] of Object.entries(seanceParPrescriptionEtDate)) {
		const s0 = groupeDeSeance[groupeDeSeance.length - 1];
		console.log('conventions', conventions);
		const { seances, valeur_totale, total_recu, lines } = await groupSeanceInAttestations(
			groupeDeSeance,
			sp,
			patient,
			conventions
		);
		let nextAttestation = {
			user_id: appState.user.id,
			patient_id: s0.patient_id,
			sp_id: s0.sp_id,
			created_at: s0.date,
			date: lines[lines.length - 1].date,
			prescription_id: s0.prescription_id,
			attestation_id: crypto.randomUUID(),
			porte_prescr: !sp.attestations?.some((a) => a.porte_prescr),
			has_been_printed: false,
			numero_etablissement: sp?.numero_etablissement,
			service: sp?.service,
			total_recu,
			valeur_totale,
			mutuelle_paid: false,
			patient_paid: false,
			tiers_payant: patient.tiers_payant,
			ticket_moderateur: patient.ticket_moderateur,
			bim: patient.bim,
			lines,
			seances: seances.map((s) => ({
				seance_id: s.seance_id,
				code_id: s.metadata.codes.kine.code_id,
				metadata: s.metadata
			})),
			generateFacturePatient: patient.ticket_moderateur,
			printFacturePatient: patient.ticket_moderateur,
			generateFactureMutuelle: patient.tiers_payant,
			printFactureMutuelle: patient.tiers_payant,
			numero: numero + attestationNumber
		};
		attestationNumber++;
		yield nextAttestation;
	}
}
