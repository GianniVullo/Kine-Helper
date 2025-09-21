import { DatabaseManager } from '../cloud/database';
import { retrieveSettings } from '../user-ops-handlers/settings';
import { user } from '../stores/UserStore';
import { invoke } from '@tauri-apps/api/core';
import { trace, error as errorLog } from '@tauri-apps/plugin-log';
import { AsyncQueueManager } from '../cloud/libraries/History/history-manager/HistoryManager.svelte';
import { SAMLToken } from '../cloud/libraries/Mycarenet/SAMLToken';
import { info } from '../cloud/libraries/logging';
import { DUMMY_ORGANIZATIONS, sidebarSeeds } from './types';

/** @typedef {import('./types').AppStateType} AppStateType */
/** @typedef {import('./types').Organization} Organization */

class AppState {
	/** @type {AppStateType['user']} */
	user;
	/** @type {AppStateType['session']} */
	session;
	/** @type {AppStateType['organizations']} */
	organizations = $state(DUMMY_ORGANIZATIONS);
	/** @type {AppStateType['settings']} */
	settings;
	/** @type {AppStateType['db']} */
	db;
	/** @type {AppStateType['queue']} */
	queue;

	connectivite = true;
	/** @type {AppStateType['eHealth']} */
	eHealth = null;

	constructor() {
		info('in AppState constructor');
		this.queue = new AsyncQueueManager();
		info('AppState constructor done');
	}

	get selectedOrg() {
		return this.organizations.find((o) => o.selected);
	}

	async initializeDatabase(offre) {
		this.db = new DatabaseManager(null, offre || this.user?.offre || 'local');
		await this.db.initializing();
	}

	async init({ user, session, organizations = [] }) {
		trace('entering AppState.init');
		console.log('Organization in appstate.init :', organizations);
		await this.queue.setup();
		// lors de la première initialisation
		if (user && session) {
			// Pour pouvoir offrir l'email pré-rempli dans l'écran de login
			trace('Setting The lastLoggedUser in LocalStorage');
			localStorage.setItem('lastLoggedUser', user.email);
			this.user = user;
			this.session = session;
			this.organizations = organizations;
			// TODO Handle error here
			trace('Setting the AppState Cache in Rust with db path = ' + this.db.db.path);
			info('Setting the AppState Cache in Rust with db path =', this.db);
			try {
				await invoke('set_app_state', {
					user: this.user,
					session,
					db: this.db.db.path,
					organizations
				});
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
				let { user, session, db, e_health: eHealth, organizations } = await invoke('get_app_state');
				dbPath = db;
				info('Refeted = ', user, session, db);

				this.user = user;
				this.session = session;
				this.organizations = organizations;
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

	async set_selected_organization(organization_id) {
		this.organizations = this.organizations.map((o) => ({
			...o,
			selected: o.id === organization_id
		}));
		try {
			await invoke('set_organizations', { organizations: this.organizations });
		} catch (error) {
			console.error('Error setting organizations in Rust:', error);
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

	setOrg(orgId) {
		this.organizations = this.organizations.map((o) => {
			console.log('IN THE MAP FN WITH O = ', o.id, orgId, o.selected);
			o.selected = o.id === orgId;
			return o;
		});
		invoke('set_organizations', { organizations: this.organizations }).then(() => {
			this.setColors(this.organizations.findIndex((o) => o === this.selectedOrg));

			console.log('ORG SET now selected is : ', this.selectedOrg);
		});
	}
	setColors(index) {
		const colorPanel = sidebarSeeds[Object.keys(sidebarSeeds)[index]];
		for (const tone of Object.keys(colorPanel)) {
			console.log('tone', tone);
			document.documentElement.style.setProperty(`--color-sidebar-${tone}`, colorPanel[tone]);
		}
	}
}

export const appState = new AppState();
