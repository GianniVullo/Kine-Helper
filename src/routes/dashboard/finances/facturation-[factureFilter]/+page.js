import { error } from '@sveltejs/kit';
import { appState } from '../../../../lib/managers/AppState.svelte';
import { uuidRegex } from '../../../../lib/utils/validationGenerics';
import { attestationGenerator } from '../../../../lib/user-ops-handlers/attestations';

/**
 ** Ici il faut :
 ** 	- Récupérer toutes les séances non attestées de l'utilisateur
 ** 	- Les trier par situation pathologique
 ** 	- Au sein de chaque sp les trier par prescription et par date
 ** 	- Grouper les séances en attestations
 ** 	- Grouper les attestations par situation pathologique
 **   	- Grouper les sp par patient
 **		- Grouper les patients par mutuelle si tp et en non-tiers payant
 */
/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	if (!appState.db) {
		await appState.init({});
	}
	// Si c'est pour un seul patient
	if (uuidRegex.test(params.factureFilter)) {
		return {
			patients: await fetchAndSortAttestations(' AND p.patient_id = $1', [params.factureFilter])
		};
	} else if (params.factureFilter === 'tp') {
		return { patients: await fetchAndSortAttestations(' AND p.tiers_payant = $1', [true]) };
	} else if (params.factureFilter === 'ntp') {
		return { patients: await fetchAndSortAttestations(' AND p.tiers_payant = $1', [false]) };
	} else if (params.factureFilter === 'all') {
		return { patients: await fetchAndSortAttestations('', []) };
	} else {
		error(400, 'Invalid filter');
	}
}

async function fetchAndSortAttestations(filter, filterArgs) {
	const patientList = await getPatients(filter, filterArgs);
	let patientAttestationList = [];
	for (const patient of patientList) {
		let attestations = await getAttestationsFromPatient(patient);
		patientAttestationList.push({
			patient,
			attestations
		});
	}
	return patientAttestationList;
}

async function getPatients(filter, filterArgs) {
	const { data: patientList, error: fetchPatientError } = await appState.db.select(
		`SELECT DISTINCT p.* FROM seances s JOIN patients p ON p.patient_id = s.patient_id WHERE s.has_been_attested = 0` +
			filter,
		filterArgs
	);
	if (fetchPatientError || patientList.length === 0) {
		error(500, fetchPatientError);
	}
	return patientList;
}

async function getAttestationsFromPatient(patient) {
	// On va chercher les sp
	const { data: spList, error: fetchSpError } = await appState.db.select(
		`SELECT DISTINCT sp.* FROM seances s JOIN situations_pathologiques sp ON sp.sp_id = s.sp_id WHERE s.has_been_attested = 0 AND s.patient_id = $1`,
		[patient.patient_id]
	);
	if (fetchSpError || spList.length === 0) {
		error(500, fetchSpError);
	}
	// // On va chercher les séances
	// const { data: seanceList, error: fetchSeanceError } = await appState.db.select(
	// 	`SELECT * FROM seances WHERE sp_id = $1`,
	// 	[spList[0].sp_id]
	// );
	// if (fetchSeanceError || seanceList.length === 0) {
	// 	error(500, fetchSeanceError);
	// }
	// On génere les attestations
	let attestations = {};
	for (const spObject of spList) {
		const { data: sp, error: fetchSpError } = await appState.db.retrieve_sp(spObject.sp_id);
		if (fetchSpError) {
			error(500, fetchSpError);
		}
		attestations[sp.sp_id] = [];
		console.log('sp In getAttestationsFromPatient', sp);
		const generator = attestationGenerator(sp, patient);
		console.log('generator', generator);
		for await (const attestation of generator) {
			attestations[sp.sp_id].push(attestation);
		}
	}
	return attestations;
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ factureFilter: 'all' }];
}
