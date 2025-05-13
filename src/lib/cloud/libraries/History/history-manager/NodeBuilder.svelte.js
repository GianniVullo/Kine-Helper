/**
 * Un noeud d'historique doit contenir les données, la table et l'action à effectuer
 */

export class NodeBuilder {
	constructor() {
		this.node = null;
		this.nodeType = null;
		this.nodeData = null;
		this.nodeId = null;
		this.nodeAction = null;
		this.nodeDate = null;
	}

	async encrypt(data) {
		for (const column of Object.keys(data)) {
			console.log('column', column);
			console.log('data[column]', data[column]);
			if (
				typeof data[column] === 'boolean' ||
				typeof data[column] === 'object' ||
				Array.isArray(data[column])
			) {
				data[column] = await invoke('encrypt_string', {
					input: JSON.stringify(data[column]),
					userId: appState.user.id
				});
			} else if (typeof data[column == 'string']) {
				data[column] = await invoke('encrypt_string', {
					input: data[column],
					userId: appState.user.id
				});
			} else {
				data[column] = null;
			}
		}
		data.user_id = appState.user.id;
		return data;
	}

	async decrypt(data) {
		if (data) {
			for (const column of Object.keys(data)) {
				data[column] = await invoke('decrypt_string', {
					encrypted: data[column]
				});
			}
		}
		return data;
	}
}

export const NodeTypeNames = [
	'Kine',
	'Settings',
	'Patient',
	'SituationPathologique',
	'Prescription',
	'Accord',
	'Seance',
	'MultipleSeance',
	'Attestation',
	'Facture'
];

// Here we need to define the custom nodes that performs special actions like when creating an attestation both the attestation and linked seances and prescription are implied
export const OperationTypes = ['create', 'update', 'delete'];

export const DataTypes = [];
