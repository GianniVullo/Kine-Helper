import { appState } from '../managers/AppState.svelte';

export async function createSeance(data) {
	return await appState.db.insert('seances', data);
}

export async function editSeance(data, id) {
	return await appState.db.update('seances', [['seance_id', id]], data);
}

export async function deleteSeance(data) {}

export async function listSeances(data) {}

export async function retrieveSeance(params) {}
