/**
 **  Ici il faut s'arranger pour que le logiciel se synchronise avec le serveur
 ** ça demande de vérifier :
 * - La liste des médecins du kinés => Non car on va plutôt faire ça avec le cloud
 ** - la liste des codes (On arrête avec le gzip, c'est de la suroptimisation inutile)
 ** - l'historique de noeud
 */

import { supabase } from '../stores/supabaseClient';
import { db } from './database';

//* j'ai extrait cette opération en function pour pouvoir la réutiliser ailleurs facilement
export async function establishServerLocalSynchronization() {
    //* Ici il faut qu'on réussisse a établir une relation de confiance entre le serveur et 
}

export class Synchroniseur {
	// au début j'avais mis un constructeur et tout avec des valeurs qu'il aurait fallu fetch ailleurs... vas-y. On fait tout ici cé bon.
	async synchronization() {
		await this.synchronisationDeConvention();
		await this.synchronisationDeHistorique();
	}
	async synchronisationDeConvention() {
		/**
		 ** Il faut toujours que le logiciel aie au moins l'année d'avant et l'année en cours. Étapes pour se faire :
		 ** 1. Fetch la lastConvention sur le serveur
		 ** 2. Fetch la lastConvention en local
		 ** 3. Si pas de convention en local : Fetch tout sur le server à partir de currentYear - 1 (Oui parce que parfois il y a plusieurs conventions sur l'année en cours)
		 ** 4. Si convention en local != lastConvention sur le serveur fetch toutes les conventions entre la convention en local et la last convention venue du serveur
		 ** 5. Si convention en local == lastConvention on ne fait rien et on passe à la suite
		 */
		//? fetch from Supabase
		let { data: lastConvention, error } = await supabase
			.from('conventions')
			.select('convention_id, created_at');

		if (error) {
			throw new Error('unable to fetch convention from server');
		}
		lastConvention = lastConvention[0];

		//? Fetch from local
		const localConvetions = await db.select(
			'SELECT created_at, convention_id ORDER BY created_at DESC LIMIT 1'
		);

		//? Si la db est vide
		if (!localConvetions || localConvetions?.length === 0) {
			// Comme il n'y a rien dans la db locale on fetch toutes les conventions
			const { data, error } = await supabase.from('conventions').select('*, code(*)');
			await insertConventionsInLocalDB(data);
		} else if (localConvetions[0].convention_id != lastConvention.convention_id) {
			//? Si la db n'est pas à jour, on fetch toutes les conventions venant après la dernière en mémoire
			const { data, error } = await supabase
				.from('conventions')
				.select('*, code(*)')
				.gt('created_at', startOfLastYear);
			await insertConventionsInLocalDB(data);
		} // else do nothing cause "all was well" ... except for the house elves...
	}

	async synchronisationDeHistorique() {
		/**
		 * glossaire : dbl = db locale dbr db remote
		 ** 1. On fecth le dernier historyNode en local
		 ** 2. On fetch le dernier historyNode sur le serveur
		 ** 3. Résolutions de conflits : Plusieurs problèmes peuvent arriver :
		 **     1. la dbl est en avance sur la dbr mais la dbr ne contient pas de données inconnues de la dbl
		 **         -> dbl envoie les noeuds en retards
		 **     2. la dbr est en avance sur la dbl mais la dbr ne contient pas de données inconnues de la 
		 **         -> la dbr envoie les noeuds en retards à la dbl
		 **     3. idem 2. mais la dbr 
		 **         ->
		 **     2.
		 **         ->
		 **     2.
		 **         ->
		 **     2.
		 **         ->
		 **     2.
		 **         ->
		 */
	}
}

async function insertConventionsInLocalDB(conventions) {
	await db.insert(
		'conventions',
		c.map((c) => ({
			convention_id: c.convention_id,
			titre: c.titre,
			documents: c.documents,
			created_at: c.created_at,
			year: c.year,
			month: c.month,
			day: c.day
		}))
	);
	await db.insert(
		'codes',
		c
			.map((c) => c.codes)
			.flat()
			.map((c) => ({
				code_id: c.code_id,
				code_reference: c.code_reference,
				groupe: c.groupe,
				type: c.type,
				duree: c.duree,
				lieu: c.lieu,
				amb_hos: c.amb_hos,
				lourde_type: c.lourde_type,
				drainage: c.drainage,
				honoraire: c.honoraire,
				coefficient: c.coefficient,
				remboursement: c.remboursement,
				valeur: c.valeur,
				convention_id: c.convention_id
			}))
	);
}
