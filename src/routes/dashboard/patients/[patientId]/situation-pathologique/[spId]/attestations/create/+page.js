import { appState } from '../../../../../../../../lib/managers/AppState.svelte.js';
import { groupSeanceInAttestations } from '../../../../../../../../lib/cloud/components/forms/attestation/AttestationSchema.js';
import dayjs from 'dayjs';
import { error } from '@sveltejs/kit';
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
	if (!appState.db) {
		await appState.init({});
	}
	const { sp, patient } = await parent();
	let prescription_id;
	let fromYear;
	const seancesToDealWith = [];
	for (const seance of sp.seances) {
		if (seance.has_been_attested || seance.attestation_id) continue;
		if (seance.seance_type === 3) {
			await appState.db.update(`UPDATE seances SET has_been_attested = true WHERE id = $1;`, [
				seance.id
			]);
			continue;
		}
		if (!prescription_id) {
			prescription_id = seance.prescription_id;
		}
		if (!fromYear) {
			fromYear = dayjs(seance.date).year();
		}
		if (seance.prescription_id !== prescription_id) {
			continue;
		}
		if (dayjs(seance.date).year() !== fromYear) {
			continue;
		}
		seancesToDealWith.push(seance);
	}
	const { seances, valeur_totale, total_recu, lines } = await groupSeanceInAttestations(
		seancesToDealWith,
		sp,
		patient
	);
	let numero = await appState.db.getItem('num_attestation');
	return {
		numero,
		valeur_totale: valeur_totale.toFixed(2).replace('.', ','),
		total_recu: total_recu.toFixed(2).replace('.', ','),
		seances,
		lines,
		prescription_id
	};
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient', spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2' }];
}
