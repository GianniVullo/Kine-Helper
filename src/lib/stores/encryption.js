/*
 * Ici on va encrypter et décrypter toutes les tables de données
 * Nous allons créer des schémas d'encryptions par table.
 * Cela va permettre de créer deux fn encryptTable et decryptTable
 * qui vont consommer ces schémas pour construire une version encryptée
 * et décryptée de ces données.
 * Le schéma comportera, pour chaque table, un liste des attributs à ne pas encrypter.
 **/
import { invoke } from '@tauri-apps/api/core';
import { get } from 'svelte/store';
import { user } from './UserStore';

//TODO ajouter un decryptionSchema qui donne les dataTypes des champs pour obtenir des objets conforment aux attentes de Kiné Helper

//* Le schéma d'encryption
export const encryptionSchema = {
	patients: {
		visibleFields: ['patient_id', 'actif', 'user_id'],
		excluded: ['situations_pathologiques']
	},
	situations_pathologiques: {
		visibleFields: ['patient_id', 'sp_id', 'user_id', 'created_at'],
		excluded: [
			'generateurs_de_seances',
			'seances',
			'prescriptions',
			'attestations',
			'documents',
			'upToDate'
		]
	},
	attestations: {
		visibleFields: [
			'attestation_id',
			'patient_id',
			'sp_id',
			'prescription_id',
			'user_id',
			'mutuelle_paid',
			'patient_paid'
		],
		excluded: []
	},
	prescriptions: {
		visibleFields: ['prescription_id', 'patient_id', 'sp_id', 'user_id'],
		excluded: []
	},
	documents: {
		visibleFields: ['document_id', 'patient_id', 'sp_id', 'user_id'],
		excluded: []
	},
	//! Il va falloir rajouter un champ durée ou un champ 'end'
	//! pour l'agenda sur leur site internet.
	seances: {
		visibleFields: ['seance_id', 'user_id', 'sp_id', 'patient_id', 'date', 'end'],
		excluded: []
	},
	settings: { visibleFields: [], excluded: [] },
	kines: {
		visibleFields: ['user_id', 'nom', 'prenom', 'migrated', 'offre', 'stronghold_key', 'email'],
		excluded: ['has_stronghold_key']
	}
};

export async function encryptTable(table, formData, key) {
	// Ici je deepCopy formData pour être sûr de ne jamais affecter les objets référencés dans formData
	const formDataDeepCopy = JSON.parse(JSON.stringify(formData));
	const unencrypted = {};

	prepareEncryptedData(table, unencrypted, formDataDeepCopy);

	if (Object.keys(formDataDeepCopy).length === 0) {
		return unencrypted;
	}
	unencrypted['encrypted'] = await invoke('encrypt_string', {
		input: JSON.stringify(formDataDeepCopy)
	});
	console.log('after encryption');

	return unencrypted;
}

export async function decryptTable(table, formData) {

	const unencrypted = {};

	prepareEncryptedData(table, unencrypted, formData);

	console.log('after prepareEncryptedData ', unencrypted, formData);

	if (Object.keys(formData).length === 0) {
		return unencrypted;
	}
	let decrypted = formData.encrypted
		? await invoke('decrypt_string', {
				encrypted: formData.encrypted
			})
		: null;
	if (decrypted) {
		return {
			...unencrypted,
			...JSON.parse(decrypted)
		};
	} else {
		return unencrypted;
	}
}

function prepareEncryptedData(table, unencrypted, formData) {
	console.log('in prepareEncryptedData with ', table, unencrypted, formData);

	for (const fields of encryptionSchema[table].visibleFields) {
		if (Object.keys(formData).includes(fields)) {
			unencrypted[fields] = formData[fields];
		}
		delete formData[fields];
	}

	for (const fields of encryptionSchema[table].excluded) {
		if (Object.keys(formData).includes(fields)) {
			delete formData[fields];
		}
	}

	if (!Object.keys(unencrypted).includes('user_id')) {
		unencrypted.user_id = get(user).user.id;
	}
}
