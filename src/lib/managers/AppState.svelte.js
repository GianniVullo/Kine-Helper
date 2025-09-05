import { DatabaseManager } from '../cloud/database';
import { retrieveSettings } from '../user-ops-handlers/settings';
import { user } from '../stores/UserStore';
import { invoke } from '@tauri-apps/api/core';
import { trace, error as errorLog } from '@tauri-apps/plugin-log';
import { AsyncQueueManager } from '../cloud/libraries/History/history-manager/HistoryManager.svelte';
import { Dayjs } from 'dayjs';
import { SAMLToken } from '../cloud/libraries/Mycarenet/SAMLToken';
import { info } from '../cloud/libraries/logging';

/**
 ** L'objet AppState est là pour stocker les données importantes at runtime
 **
 */
class AppState {
	user;
	session;
	connectivite = true;
	settings; // Important de l'avoir at runtime parce que petit et en interaction forte avec l'UI
	/**@type DatabaseManager */
	db; // DB connection
	queue;
	/**
	 * @type {{ssin: string, certificate: string, saml_token: SAMLToken} | null}
	 */
	eHealth = null;

	constructor() {
		info('in AppState constructor');
		this.queue = new AsyncQueueManager();
		info('AppState constructor done');
	}

	async initializeDatabase(offre) {
		this.db = new DatabaseManager(null, offre || this.user?.offre || 'local');
		await this.db.initializing();
	}

	async init({ user, session }) {
		trace('entering AppState.init');
		await this.queue.setup();
		// lors de la première initialisation
		if (user && session) {
			// Pour pouvoir offrir l'email pré-rempli dans l'écran de login
			trace('Setting The lastLoggedUser in LocalStorage');
			localStorage.setItem('lastLoggedUser', user.email);
			this.user = user;
			// TODO Handle error here
			trace('Setting the AppState Cache in Rust with db path = ' + this.db.db.path);
			info('Setting the AppState Cache in Rust with db path =', this.db);
			try {
				await invoke('set_app_state', { user: this.user, session, db: this.db.db.path });
			} catch (error) {
				console.error('Error setting AppState Cache in Rust:', error);
			}
			info('AppState Cache set in Rust');

			if (!this.settings) {
				this.settings = await retrieveSettings(user.id);
			}
		} else {
			// le de toutes les initialisations subséquentes à un rechargement de la page
			let dbPath;
			if (!this.user || !this.session) {
				// les if statement viennent éviter les chargements inutiles bien que ceux-ci soient de l'ordre de la poignée de millisecondes
				// TODO handle error here
				trace('Refetch the appState from Rust');
				let { user, session, db, e_health: eHealth } = await invoke('get_app_state');
				dbPath = db;
				info('Refeted = ', user, session, db);

				this.user = user;
				this.session = session;
				if (dbPath) this.db = new DatabaseManager(dbPath);
				info('eHealth from rust', eHealth);
				if (eHealth && eHealth.saml_token) {
					// On reconstruit l'objet SAMLToken pour retrouver les méthodes associées
					this.eHealth = { ...eHealth, saml_token: new SAMLToken(eHealth.saml_token) };
				}
			}

			if (!this.settings && this.user) {
				let { data, error } = await retrieveSettings(this.user.id);
				if (error) {
					errorLog(error);
				}
				this.settings = data;
			}
		}
	}

	async set_eHealth(eHealth) {
		this.eHealth = eHealth;
		try {
			await invoke('set_e_health', { eHealth: this.eHealth });
		} catch (error) {
			console.error('Error setting eHealth in Rust:', error);
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

	// async initialiseKineHelper(submitter) {
	// 	// TODO Cette partie ci va être déplacée dans la barre de tâche de l'ui pour ne pas retarder le chargement de la page
	// 	submitter.innerHTML = get(t)('login', 'submission.convention');
	// 	await initializeConventions(submitter);
	// }

	has_complete_profile() {
		return (
			this.user.nom &&
			this.user.prenom &&
			this.user.adresse &&
			this.user.cp &&
			this.user.localite &&
			this.user.inami &&
			this.user.iban &&
			this.user.bce
		);
	}
}

export const appState = new AppState();
