import { bench, describe, expect, test } from 'vitest';
import { encryptTable, decryptTable, encryptionSchema } from './encryption';
import { invoke } from '@tauri-apps/api/core';

describe('Encryption Utils', () => {
	test('Patient', () => {
		expect(mockEncryptTable('patients', patient)).toEqual({
			patient_id: 'test_id',
			actif: true,
			encrypted: 'blablabala',
			user_id: 'test_id'
		});
	});
	test('Situation Pathologique', () => {
		expect(mockEncryptTable('situations_pathologiques', sp)).toEqual({
			patient_id: 'test_id',
			sp_id: 'test_id',
			created_at: '2021-07-27T16:02:08.070557',
			encrypted: 'blablabala',
			user_id: 'test_id'
		});
	});
});

const patient = {
	patient_id: 'test_id',
	actif: true,
	user_id: 'test_id',
	created_at: '2021-07-27T16:02:08.070557',
	nom: 'Vullo',
	prenom: 'Gianni',
	niss: '121212123432',
	adresse: 'Rue des rhododendrons',
	cp: '8400',
	localite: 'Charleroi',
	date_naissance: '2021-07-27',
	tel: null,
	gsm: undefined,
	email: 'blabla@email.com',
	sexe: 'M',
	mutualite: 125,
	num_affilie: '21431241234214',
	tiers_payant: true,
	ticket_moderateur: false,
	bim: true,
	numero_etablissment: '27',
	service: 'Déontologie'
};

const sp = {
	sp_id: 'test_id',
	created_at: '2021-07-27T16:02:08.070557',
	numero_etablissement: '',
	service: '',
	patient_id: 'test_id',
	user_id: 'test_id',
	motif: 'blabla',
	plan_du_ttt: 'blabla',
	intake: true,
	with_indemnity: false,
	rapport_ecrit: false,
	rapport_ecrit_custom_date: undefined,
	rapport_ecrit_date: 'blabla',
	groupe_id: 1,
	patho_lourde_type: 2,
	lieu_id: 3,
	duree: 2,
	volet_j: true,
	volet_h: true,
	gmfcs: 3,
	seconde_seance_fa: false,
	seconde_seance_e: true,
	duree_seconde_seance_fa: 1,
	deja_faites: 10,
	date_presta_chir_fa: '2021-07-27'
};

function mockEncryptTable(table, formData, key) {
	const unencrypted = {};
	for (const fields of encryptionSchema[table]) {
		unencrypted[fields] = formData[fields];
		delete formData[fields];
	}
	if (Object.keys(formData).length === 0) {
		return unencrypted;
	}
	unencrypted['encrypted'] = 'blablabala';
	return unencrypted;
}

async function mockDecryptTable(table, formData, key) {
	const unencrypted = {};
	for (const fields of encryptionSchema[table]) {
		unencrypted[fields] = formData[fields];
		delete formData[fields];
	}
	if (Object.keys(formData).length === 0) {
		return unencrypted;
	}

	return {
		...unencrypted,
		...JSON.parse(
			await invoke('decrypt_string', {
				input: formData.encrypted
			})
		)
	};
}
