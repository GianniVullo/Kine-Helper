import { DatabaseManager } from '../cloud/database';
import Database from '@tauri-apps/plugin-sql';
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
	contratStatus;

	async init(user, session, settings, contrat) {
		console.log('IN the AppState init function');

		// Pour pouvoir offrir l'email pré-rempli dans l'écran de login
		localStorage.setItem('lastLoggedUser', user.email);
		sessionStorage.setItem('user', JSON.stringify(user));
		sessionStorage.setItem('supabaseSession', JSON.stringify(session));
		sessionStorage.setItem('contrat', JSON.stringify(contrat));
		this.user_data = user;
		this.session_data = session;
		this.settings = settings;
		this.contratStatus = contrat;
		this.db = new DatabaseManager();
		await this.db.initializing();
		/**
		 ** Lorsque la page est rafraichie, que ce soit par le système où manuellement par l'utilisateur toutes les données contenues dans appState peuvent être perdues.
		 ** Pour les données user et session il faut les stocker dans session storage pour éviter que les données soient récupérées lors d'ouverture ultérieure de Kiné Helper
		 ** Pour les données de settings, matériel et patient c'est stocké dans la db. donc si à un moment donné l'appli se rend compte que l'une de ces données est manquantes elle peut :
		 **     - tenter de les récupérer dans la base de donnée
		 **     - gérer l'erreur en coupant le système ou en redirigeant l'utilisateur à une page de l'application ou considérée comme "safe"
		 */
	}

	get user() {
		if (this.user_data) {
			return this.user_data;
		}
		const user = sessionStorage.getItem('user');
		if (user) {
			return user;
		}
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
}

export const appState = new AppState();
