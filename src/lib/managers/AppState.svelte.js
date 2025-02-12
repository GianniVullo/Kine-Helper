import { get } from 'svelte/store';
import { DatabaseManager } from '../cloud/database';
import Database from '@tauri-apps/plugin-sql';
import { initializeConventions } from '../stores/conventionStore';
import { retrieveSettings } from '../user-ops-handlers/settings';
import { file_exists } from '../utils/fsAccessor';
import { user } from '../stores/UserStore';
import { listPatients } from '../user-ops-handlers/patients';
import { t } from '../i18n';
/**
 ** L'objet AppState est là pour stocker les données importantes at runtime
 **
 */
class AppState {
	user_data;
	session_data;
	connectivite = true;
	settings; // Important de l'avoir at runtime parce que petit et en interaction forte avec l'UI
	/**@type Database */
	db; // DB connection
	contratStatus; //! inutile en fait, il est dans user.
	async initializeDatabase() {
		this.db = new DatabaseManager();
		await this.db.initializing();
	}

	init(settings, profil) {		
		this.user_data = { ...this.user_data, ...profil };
		// Pour pouvoir offrir l'email pré-rempli dans l'écran de login
		localStorage.setItem('lastLoggedUser', this.user_data.email);
		sessionStorage.setItem('user', JSON.stringify(this.user_data));
		sessionStorage.setItem('contrat', JSON.stringify(profil.offre));
		this.settings = settings;
		this.contratStatus = profil.offre;
	}

	get user() {
		if (this.user_data) {
			return this.user_data;
		}
		const user = JSON.parse(sessionStorage.getItem('user'))?.user;
		console.log('USER : ', user);

		if (user) {
			return user;
		}
	}

	set user(user) {
		sessionStorage.setItem('user', JSON.stringify(user));
		this.user_data = user;
	}
	set session(session) {
		sessionStorage.setItem('supabaseSession', JSON.stringify(session));
		this.session_data = session;
	}

	get session() {
		if (this.user_data) {
			return this.user_data;
		}
		const session = sessionStorage.getItem('supabaseSession');
		if (session) {
			return session;
		}
	}

	get contrat() {
		if (this.contratStatus) {
			return this.contratStatus;
		}
		const contrat = sessionStorage.getItem('contrat');
		if (contrat) {
			return contrat;
		}
	}

	get readOnly() {
		if (this.contrat.includes('cloud') && !this.connectivite) {
			return true;
		}
		return false;
	}

	setProfile(data) {
		this.user = { ...this.user, ...data };
	}

	async initialiseKineHelper(submitter) {
		// TODO Cette partie ci va être déplacée dans la barre de tâche de l'ui pour ne pas retarder le chargement de la page
		submitter.innerHTML = get(t)('login', 'submission.convention');
		await initializeConventions(submitter);
	}

	has_complete_profile() {
		let profil = this.user;
		console.log(profil);
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
