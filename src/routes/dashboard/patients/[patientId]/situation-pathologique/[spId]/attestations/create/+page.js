import dayjs from 'dayjs';
import { appState } from '../../../../../../../../lib/managers/AppState.svelte.js';

/**
 * 
 ** Attends parce qu'en fait je suis entrain de me rendre compte que en faisant un meilleur travail en amont avec une API tarif et supplément aux honoraires, ce serait bcp plus facile ici... Il "suffirait" d'ajouter un champ "metadata" sur l'objet séance qui recevrait les lignes supplémentaires : rapport écrit, intake, dépassement
 */
export async function load({ url, parent }) {
	/**
	 ** Il faut :
	 ** 	- Réunir toutes les séances à tarifer
	 ** 	- retourner les codes qui seront utilisés
	 **		- répartir ces séances en attestations
	 */
	const { patient, sp } = await parent();
	let untill = url.searchParams.get('untill');
	let seances = sp.seances.filter((seance) => {
		return (
			(dayjs(seance.date).isSame(dayjs(untill)) || dayjs(seance.date).isBefore(dayjs(untill))) &&
			!seance.has_been_attested
		);
	});
	/** d'abord faut fetch les codes
	 * puis faut obtenir les conventions ou bien les pseudo-codes
	 */
	let conventions = await appState.db.select(`SELECT DISTINCT 
    c.convention_id,
    c.titre,
    c.documents,
    c.created_at,
    c.year,
    c.month,
    c.day,
    json_group_array(json_object(
        'code_id', cd.code_id,
        'code_reference', cd.code_reference,
        'groupe', cd.groupe,
        'type', cd.type,
        'duree', cd.duree,
        'lieu', cd.lieu,
        'amb_hos', cd.amb_hos,
        'lourde_type', cd.lourde_type,
        'drainage', cd.drainage,
        'honoraire', cd.honoraire,
        'coefficient', cd.coefficient,
        'remboursement', cd.remboursement,
        'valeur', cd.valeur
    )) AS codes
FROM conventions c
JOIN codes cd ON c.convention_id = cd.convention_id
WHERE cd.code_id IN ('code1', 'code2', 'code3') -- Replace with actual code_id list
GROUP BY c.convention_id;`);

	// vazy on construit directement l'attestation =>

	return { conventions, seances };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient', spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2' }];
}

function groupSeanceInAttestations(seances) {
		const groupedByPrescription = new Map();

		// Step 1: Group seances by prescription_id
		for (const seance of seances) {
			if (!groupedByPrescription.has(seance.prescription_id)) {
				groupedByPrescription.set(seance.prescription_id, []);
			}
			groupedByPrescription.get(seance.prescription_id).push(seance);
		}

		const result = [];

		// Step 2: Process each prescription group
		for (const [prescriptionId, seanceList] of groupedByPrescription) {
			// Sort by date
			seanceList.sort((a, b) => new Date(a.date) - new Date(b.date));

			let batch = [];
			let batchCount = 0;

			for (const seance of seanceList) {
				// Ici il faut ajouter les lignes intake, rapport écrit, examen à titre consultatif, indemnité de déplacement
				const lieuWeight = codesById[seance.code_id]?.lieu === 3 ? 2 : 1;

				if (batchCount + lieuWeight > 20) {
					result.push({ prescription_id: prescriptionId, seances: batch });
					batch = [];
					batchCount = 0;
				}

				batch.push(seance);
				batchCount += lieuWeight;
			}

			// Push the last batch if it has seances
			if (batch.length > 0) {
				result.push({ prescription_id: prescriptionId, seances: batch });
			}
		}

		return result;
	}