import { getModalStore } from '@skeletonlabs/skeleton';

/**
 ** Error manager est responsable de déclencher les différentes actions en cas d'erreur :
 **     - Afficher une fenêtre d'erreur
 **     - Afficher un signal dans la barre de fond
 **     - Envoyer un message à l'administrateur
 **     - Enregistrer des logs dans un fichier dédié
 */
class ErrorManager {
	errors = $state([]);
	constructor() {}

	displayErrorModal(errorMessage) {
		const modalStore = getModalStore();
		modalStore.trigger({
			type: 'alert',
			title: 'Erreur',
			body: errorMessage,
			buttonTextCancel: 'Ok',
			buttonTextConfirm: 'Ok'
		});
	}
}
