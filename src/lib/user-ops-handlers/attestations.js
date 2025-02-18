import { UserOperationsHandler } from './abstractHandler';
import DBAdapter from '$lib/user-ops-handlers/dbAdapter';
import { get } from 'svelte/store';
import { patients } from '../stores/PatientStore';
import { user } from '../stores/UserStore';
import { appState } from '../managers/AppState.svelte';

function setupAttestationOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	return opsHandler;
}

export async function createAttestation(data) {
	const opsHandler = setupAttestationOpsHandler();
	opsHandler.execute(async () => {});
}

// TODO : absolutely not functional
export async function getCodes(data) {
	const opsHandler = setupAttestationOpsHandler();
	opsHandler.execute(async () => {
		let { data, error } = await appState.db.select('SELECT * FROM codes WHERE code_id = $1', [
			code_id
		]);
	});
}

export async function updateAttestation(data) {
	const opsHandler = setupAttestationOpsHandler();
	opsHandler.execute(async () => {
		const db = new DBAdapter();
		await db.update(
			'attestations',
			[
				['user_id', get(user).user.id],
				['patient_id', data.patient_id],
				['attestation_id', data.attestation_id]
			],
			data
		);
		patients.update((p) => {
			const rpatient = p.find((p) => p.patient_id === data.patient_id);
			const rsp = rpatient.situations_pathologiques.find((lsp) => lsp.sp_id === data.sp_id);
			let attest = rsp.attestations.find((a) => a.attestation_id === data.attestation_id);
			attest.mutuelle_paid = data.mutuelle_paid;
			attest.patient_paid = data.patient_paid;
			attest.total_recu = data.total_recu;
			attest.valeur_totale = data.valeur_totale;
			return p;
		});
	});
}

export async function deleteAttestation(data) {}
