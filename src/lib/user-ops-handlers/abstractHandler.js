/**
 ** UserOperationsHandler se veut une classe qui va permettre de composer des handlers spécifiques à chaques objets.
 ** Il est là pour réunir les différentes actions nécessaires aux opérations de l'utilisateur
 **     - Effectuer une opération sur la Base de Donnée
 **     - Mettre à jour le système de store de l'application
 **     - Permettre une gestion des erreures centralisées
 **		- Permettre le traitement de ces erreures (par exemple déclencher un modal signalant qu'une erreur à eu lieu et proposer de retenter l'opération ou une solution, si l'erreur est connue par exemple)
 **     - Permettre de laisser une porte ouverte pour de futures implémentations comme, par exemple, un historique d'actions utilisateur (gérer sur LocalDB?). Cela permettrait à l'utilisateur de revenir en arrière facilement.
 *
 */

//! En fait ce qui pourrait être cool ce serait simplement d'avoir une fonction qui construirait un UserOperationsHandler pour chaque objet, comme ça dans le code après on peut simplement appeler const userOperationHandler = createPatientOpsHandler(*args **kwargs)

//? Ca me semble lourd compte tenu du fait que les opérations vont être utilisées une à une. Mais d'un autre côté

export class UserOperationsHandler {
	
	constructor() {
		//* L'idée ici c'est d'avoir une liste de codes/nom d'error en clé et un handler spécifique à l'erreur en valeur. Peut-être serait-ce intelligent d'avoir au moins une clé de base qui serait le fallback si l'erreure n'est pas reprise
		this.errors = {
			default: () => {
				//* send an email to Admin with code, log and context of the error
			}
		};
		this.errorNotifier; //? Un store qui affiche d'éventuelle erreure dans la barre d'info en bas
		this.stepsNotifier; //? Un store qui affiche l'avancée des tâches dans la barre d'info en bas
		//? Ces stores pourrait être stockés dans le store Miscellaneous ? Hm. pas sûr que ce soit une bonne idée de stocker des fonctions dans le LocalStore
		this.steps; // TODO L'idée ici c'est de pouvoir morceller les tâches et pouvoir prendre des décisions en fonction de ce qui plante (comme les transactions en SQL)
	}

	//* wrapper qui permet d'executer avec un try catch
	async execute(operation) {
		try {
			await operation();
		} catch (error) {
			// Todo use ErrorManager
			console.log(error);
		}
	}
}
