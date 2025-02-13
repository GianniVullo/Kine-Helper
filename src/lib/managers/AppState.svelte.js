import { get } from 'svelte/store';
import { DatabaseManager } from '../cloud/database';
import Database from '@tauri-apps/plugin-sql';
import { initializeConventions } from '../stores/conventionStore';
import { retrieveSettings } from '../user-ops-handlers/settings';
import { file_exists } from '../utils/fsAccessor';
import { user } from '../stores/UserStore';
import { listPatients } from '../user-ops-handlers/patients';
import { t } from '../i18n';
import { invoke } from '@tauri-apps/api/core';
/**
 ** L'objet AppState est là pour stocker les données importantes at runtime
 **
 */
class AppState {
	user;
	session;
	connectivite = true;
	settings; // Important de l'avoir at runtime parce que petit et en interaction forte avec l'UI
	/**@type Database */
	db; // DB connection

	async initializeDatabase() {
		this.db = new DatabaseManager();
		await this.db.initializing();
	}

	async init({ user, session, profil }) {
		// lors de la première initialisation
		if (user && profil && session) {
			// Pour pouvoir offrir l'email pré-rempli dans l'écran de login
			localStorage.setItem('lastLoggedUser', user.email);
			this.user = { ...user, ...profil };
			// TODO Handle error here
			await invoke('set_app_state', { user: this.user, session });

			if (!this.settings) {
				console.log();
				this.settings = await retrieveSettings(user.id);
			}
		} else {
			// le de toutes les initialisations subséquentes à un rechargement de la page
			if (!this.user || !this.session) {
				// les if statement viennent éviter les chargements inutiles bien que ceux-ci soient de l'ordre de la poignée de millisecondes
				// TODO handle error here
				let { user, session } = await invoke('get_app_state');
				this.user = user;
				this.session = session;
			}
		}

		if (!this.settings) {
			this.settings = await retrieveSettings(this.user.id);
		}
	}

	get contrat() {
		return user.offre;
	}

	get readOnly() {
		if (this.contrat.includes('cloud') && !this.connectivite) {
			return true;
		}
		return false;
	}

	async initialiseKineHelper(submitter) {
		// TODO Cette partie ci va être déplacée dans la barre de tâche de l'ui pour ne pas retarder le chargement de la page
		submitter.innerHTML = get(t)('login', 'submission.convention');
		await initializeConventions(submitter);
	}

	has_complete_profile() {
		let profil = this.user;
		return (
			profil.nom &&
			profil.prenom &&
			profil.adresse &&
			profil.cp &&
			profil.localite &&
			profil.inami &&
			profil.iban &&
			profil.bce &&
			profil.conventionne
		);
	}
}

export const appState = new AppState();
