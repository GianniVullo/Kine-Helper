import { supabase } from '../stores/supabaseClient';

class HistoryNode {
	id; // UUID so that potential conflicts can be detected
	node_type;
	created_at;
	author; // What device created it ?
	payload;

	async encrypt() {}

	async decrypt() {}

	//* Pour pouvoir facilement insérer le payload dans la db locale
	async forward() {}

	//* Pour pouvoir facilement revenir en arrière de cet historique
	async backward() {}

	// Cette méthode commune a tous les noeuds d'historique permet d'envoyer au serveur le nouveau noeud
	async sync() {
		//* Il faudrait toujours vérifier que la dbr et la dbl soient synchronisées car l'utilisateur pourrait utiliser son smartphone, sa tablette et son ordi en même temps (peu probable mais possible)
		//* Le process doit être simple : on demande le dernier uuid inséré dans la dbr et si c'est le même que le dernier dans la dbl, on envoie le noeud suivant, si ce n'est pas le même, on commence par resynchroniser les dbs, en envoyant une demande à la dbr d'envoyer tous les nodes depuis le dernier connu par la dbl
		//! Attention que cela DOIT impliquer de rafraichir les stores de l'environnement local (patients et users) atomiquement si possible (uniquement l'object modifié par exemple uniquement la séance).
		//* envoyer le noeud sur supabase
		await supabase.from('history_nodes').insert(this.toObject());
	}

	toObject() {
		return {
			id: this.id,
			node_position: this.node_position,
			node_type: this.node_type,
			created_at: this.created_at,
			author: this.author,
			payload: this.payload
		};
	}
}

class HistoryNodeManager {
	current_node_position;
}
