export async function createMultipleSeances(data) {
	// TODO
	// 1. Insérer les séances localement
	// 2. Construire un noeud d'historique
	// 3. Envoyer les séances à l'API
	console.log('createMultipleSeances', data);
	for (const seance of data.seances) {
		const { error } = await createSeance(seance);
		if (error) {
			console.error('Error creating seance:', error);
			return { data: null, error };
		}
	}
	return { data: null, error: null };
	// const { seances, attestation_id } = data;
	// const seancesToInsert = seances.map((seance) => ({
	// 	...seance,
	// 	attestation_id
	// }));
	// return await appState.db.insert('seances', seancesToInsert);
}
