import dayjs from 'dayjs';
import { appState } from '../managers/AppState.svelte';
import { invoke } from '@tauri-apps/api/core';
import { indmeniteCategory, INTAKE, RAPPORT_ECRIT } from '../stores/codeDetails';

export async function printAttestation(lines, attestation) {
	const { patient, prescription, situation_pathologique, imprimante, error } =
		await getData(attestation);

	if (!lines) {
		// TODO Ajouter indemnité de dplcmt etc
		let { data: seances, error: seancesError } = await appState.db.select(
			`SELECT seances.date, codes.code_reference, codes.convention_id, seances.metadata, seances.indemnite, seances.rapport_ecrit, seances.lieu_id, seances.groupe_id
			FROM seances 
			LEFT JOIN codes ON codes.code_id = seances.code_id 
			WHERE seances.attestation_id = $1`,
			[attestation.attestation_id]
		);
		console.log('seances in RawPrinter ==', seances);

		seances.map((seance) => {
			if (typeof seance.metadata === 'string') {
				seance.metadata = JSON.parse(seance.metadata);
			}
			if (typeof seance.indemnite === 'string') {
				seance.indemnite = JSON.parse(seance.indemnite);
			}
			if (typeof seance.rapport_ecrit === 'string') {
				seance.rapport_ecrit = JSON.parse(seance.rapport_ecrit);
			}
		});
		lines = [];
		// Add the pseudo_code to the lines
		for (const seance of seances) {
			if (seance.metadata?.intake) {
				const { data: intakeList } = await appState.db.select(
					'SELECT code_reference FROM codes WHERE convention_id = $1 AND lieu = $2 AND type = $3',
					[seance.convention_id, seance.lieu_id, INTAKE]
				);
				console.log('intakeList in RawPrinter ==', intakeList);
				lines.push({
					date: seance.date,
					code_reference: intakeList[0].code_reference
				});
			}
			if (seance.rapport_ecrit) {
				const { data: rapportList } = await appState.db.select(
					'SELECT code_reference FROM codes WHERE convention_id = $1 AND lieu = $2 AND type = $3 AND groupe = $4',
					[seance.convention_id, seance.lieu_id, RAPPORT_ECRIT, seance.groupe_id]
				);
				console.log('rapportList in RawPrinter ==', rapportList);
				lines.push({
					date: seance.date,
					code_reference: rapportList[0].code_reference
				});
			}
			if (seance.indemnite) {
				const { data: indemniteList } = await appState.db.select(
					'SELECT code_reference FROM codes WHERE convention_id = $1 AND code_reference = $2',
					[seance.convention_id, indmeniteCategory[seance.groupe_id]]
				);
				console.log('indemniteList in RawPrinter ==', indemniteList);
				lines.push({
					date: seance.date,
					code_reference: indemniteList[0].code_reference
				});
			}
			// Add the seance code_reference to the lines
			console.log('seance.code_reference in RawPrinter ==', seance.code_reference);
			lines.push({
				date: seance.date,
				code_reference: seance.code_reference
			});
		}

		if (seancesError) {
			return { error: seancesError };
		}
	}
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
			jointe_a: attestation.porte_prescr ? '' : (prescription.jointe_a ?? '')
		},
		attestation: {
			porte_prescr: attestation.porte_prescr,
			date: attestation.date,
			seances: lines.map((line) => {
				line.date = dayjs(line.date).format('DD/MM/YY');
				return line;
			}),
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
	// Add the eventual custom spacings
	let spacings = await appState.db.getItem('profilCustom-1');
	console.log(spacings);

	let printAttestationArgs = {
		printerName: imprimante.name,
		formData
	};
	if (spacings) {
		try {
			spacings = JSON.parse(spacings);

			printAttestationArgs.spacings = toRustInfo(spacings);
			printAttestationArgs.leftMargin = spacings.left_margin;
		} catch (error) {
			// Il n'y a pas de custom spacings et ce n'est pas grave
			console.error('Error while trying to read the spacings', error);
		}
	}
	console.log('ARGS = ', printAttestationArgs);
	let _res = await invoke('print_attestation', printAttestationArgs);
	return { error: null, data: _res };
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

export function toRustInfo(value) {
	let identification_section = [];
	let lignes_prestation_section = [];
	let section_prescription_hospitalisation = [];
	let section_signature = [];
	let remboursement = [];
	identification_section.push(value.initial_spacing);
	identification_section.push(value.id_name_to_mutuality);
	identification_section.push(value.id_mutuality_to_niss);
	identification_section.push(value.id_niss_to_address);
	identification_section.push(value.id_address_to_postal);
	identification_section.push(value.id_postal_to_next);
	for (let idx = 0; idx < 9; idx++) {
		let key = `presc_spacing_${idx}`;
		let spacing = value[key];
		section_prescription_hospitalisation.push(spacing);
	}
	lignes_prestation_section.push(value.prest_name_to_table);
	for (let idx = 0; idx < 10; idx++) {
		let key = `prest_line_${idx}`;
		let spacing = value[key];
		lignes_prestation_section.push(spacing);
	}
	section_signature.push(value.service_to_total);
	section_signature.push(value.sign_total_to_name);
	section_signature.push(value.sign_name_line_spacing);
	section_signature.push(value.sign_after_location);
	section_signature.push(value.sign_to_remb);

	remboursement.push(value.remb_bce_to_date);
	remboursement.push(value.remb_date_to_total);
	return [
		identification_section,
		lignes_prestation_section,
		section_prescription_hospitalisation,
		section_signature,
		remboursement
	];
}
