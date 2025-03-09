import dayjs from 'dayjs';
import { appState } from '../../../../../../../../lib/managers/AppState.svelte.js';
import { error as errorSvelte } from '@sveltejs/kit';
/**
 *
 ** En fait, pour l'instant on ne fait pas "tarifer jusqu'ici"
 **	On fait seulement 1 attestation à la fois
 */
export async function load({ url, parent }) {
	/**
	 ** Il faut :
	 ** 	- Itérer au travers des séances de la sp
	 ** 		- si elle est déjà attestée on passe
	 ** 		- Si intake ou rapport écrit lineTaken += 1
	 ** 		- Si indemnite lineTaken += 1
	 ** 		- Si linesAvailable >= à lineTaken
	 **				+ assigner le bon code à la séance (voir prochain commentaire)
	 **				+ pousser la séance dans seances
	 **				+ si il reste des séances non attestées
	 **					- Décision à prendre : Ou bien on crée d'autres attestation, ou bien on fait un signalement à l'utilisateur
	 **				- break;
	 **		- Calculer valeur_totale et total_recu et les placer dans un erzatz d'attestation (un objet avec ces deux props)
	 */
	const { sp } = await parent();
	let linesAvailable = 20;
	let seances = [];
	for (const seance of sp.seances) {
		if (seance.has_been_attested || seance.attestation_id) continue;
		let linesTaken = 1;
		if (seance.intake || seance.rapport_ecrit) {
			linesTaken++;
		}
		if (seance.indemnite) {
			linesTaken++;
		}
		if (linesAvailable >= linesTaken) {
			/**
			 ** Assignation de la nomeclature :
			 ** 	- On commence par fetcher la convention la plus récente
			 ** 	- On fetch le ou les codes qui correspondent à la séance
			 ** 	- On ajoute un dictionnaires de codes à séance.metadata
			 */
			let { data, error } = getConvention(seance);
			if (error) {
				errorSvelte(500, { message: error });
			}
			const convention = data[0];
			const code_seance = convention.filter((c) => {
				return (
					c.groupe === seance.groupe_id &&
					c.lieu === seance.lieu_id &&
					c.duree === seance.duree &&
					(sp.amb_hos ? c.amb_hos === sp.amb_hos : 'AMB') &&
					c.lourde_type === seance.patho_lourde_type
				);
			});
			code_seance.length === 0 &&
				errorSvelte(500, { message: 'Pas de code trouvé pour la séance' });
			if (seance.intake) {
				const intake = convention.filter((c) => c.type === 'intake');
				code_seance.push(intake);
			}
			if (seance.rapport_ecrit) {
				const rapport_ecrit = convention.filter((c) => c.type === 'rapport_ecrit');
				code_seance.push(rapport_ecrit);
			}
			if (seance.indemnite) {
				const indemnite = convention.filter((c) => c.type === 'indemnite');
				code_seance.push(indemnite);
			}
			seance.metadata.codes = code_seance;
			const codes = await appState.db.select(
				` SELECT 
                    cd.*
                FROM 
                    codes cd
                WHERE 
                    c.convention_id = $1
                    AND cd.groupe = $2
                    AND cd.lieu = $3
                    AND cd.duree = $4
					AND cd.amb_hos = $5
					AND cd.lourde_type = $6
                ORDER BY 
                    c.created_at DESC
                LIMIT 1;`,
				[
					convention[0].convention_id,
					seance.groupe_id,
					seance.lieu_id,
					seance.duree,
					sp.amb_hos ?? 'AMB',
					seance.patho_lourde_type
				]
			);
			seances.push(seance);
			linesAvailable -= linesTaken;
		}
	}

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
WHERE 
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

async function getConvention(seance) {
	return await appState.db.select(
		`SELECT c.*
			FROM codes AS c
			INNER JOIN conventions AS con ON c.convention_id = con.convention_id
			WHERE DATE(con.created_at) = (
				SELECT MAX(DATE(con2.created_at))
					FROM conventions AS con2
					WHERE DATE(con2.created_at) <= DATE($1)
);`,
		[seance.date]
	);
}
