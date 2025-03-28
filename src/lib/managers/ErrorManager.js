import { modalStore } from "$lib/cloud/libraries/overlays/modalUtilities.svelte";

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
		modalStore.trigger({
			type: 'alert',
			title: 'Erreur',
			body: errorMessage,
			buttonTextCancel: 'Ok',
			buttonTextConfirm: 'Ok'
		});
	}
}
