import { writable } from 'svelte/store';
import { selectPatients } from './supabaseClient';
import { persisted } from 'svelte-persisted-store';
import Database from '@tauri-apps/plugin-sql';

class ConventionManager {
	constructor() {
		this.db;
	}

	// regroupe les méthodes nécessaires à l'initialisation du manager
	init() {}

	async openDBConnection() {
		this.db = await Database.load('sqlite:kinehelper.db');
	}

	closeDBConnection() {
		return this.db.close();
	}
	// at launch returns
	isUpToDate() {
		return true;
	}
	// if isUpToDate() returns false and the latest convention name, fetch the doc via Supabase S3 bucket
	retrieveConventionFromCDN() {}

	// Mettre les conventions en mémoire vive une fois l'application lancée
	retrieveConventionsFromFile() {}

	// Diverses méthodes permettant de manipuler les conventions
}

export const conventions = createConventionsStore();
