import { UserOperationsHandler } from './abstractHandler';
import DBAdapter from './dbAdapter';
import { user } from '../stores/UserStore';
import { SituationPathologique } from './models';
import { get } from 'svelte/store';
import { appState } from '../managers/AppState.svelte';

function setupSPOpsHandler() {
	const opsHandler = new UserOperationsHandler();
	//* Modifier le handler ici pour que ça colle à l'opération : les erreurs possibles, les tâches intermédiaires par exemple.
	return opsHandler;
}

export async function createSituationPathologique(data) {
	return await appState.db.insert('situations_pathologiques', data);
}

export async function editSituationPathologique(data) {
	return await appState.db.update('situations_pathologiques', [['sp_id', data.sp_id]], data);
}

export async function deleteSituationPathologique(data) {
		await appState.db.delete('situations_pathologiques', [
			['sp_id', data.sp_id],
		]);
}

export async function retrieveLastSPWithRelatedObjectsPlusOlderSPWithoutRelatedObjects(data) {
	const opsHandler = setupSPOpsHandler();
	await opsHandler.execute(async () => {
		await getLastSpAndOthers(data.patient_id);
	});
}

export async function retrieveSituationPathologique(data) {
	let { data: completedSp, error } = await appState.db.retrieve_sp(data.sp_id);
	if (error) {
		return { data: null, error };
	}
	console.log('completedSp', completedSp);
	completedSp = new SituationPathologique(completedSp);
	completedSp.upToDate = true;
	return { data: completedSp, error };
}

async function getLastSpAndOthers(patient_id) {
	console.log('in getLastSp() with', patient_id);
	let db = new DBAdapter();
	const { data, error } = await db.get_last_sp(patient_id, get(user).user.id);
	console.log('La SP queried', data);
	if (error) throw error;
	if (data.ps.length === 0 || !data.ps[0]) return;
	let sp = new SituationPathologique({
		...data.ps[0],
		prescriptions: data.prescriptions.map((p) => {
			p.prescripteur = JSON.parse(p.prescripteur);
			return p;
		}),
		seances: data.seances.map((s) => {
			s.has_been_attested = JSON.parse(s.has_been_attested);
			return s;
		}),
		attestations: data.attestations,
		documents: data.documents
	});
	sp.upToDate = true;
	console.log('La dernière situation pathologique', sp);
	let others = await getOtherSps(patient_id, sp.sp_id, db);

	console.log('in getLastSp().getOtherSps() with', others);
	patients.update((ps) => {
		let patient = ps.find((p) => p.patient_id === patient_id);
		patient.situations_pathologiques.push(sp);
		for (const dlSp of others) {
			patient.situations_pathologiques.push(dlSp);
		}
		return ps;
	});
}

async function getOtherSps(patient_id, sp_id, db) {
	console.log('in getLastSp() with', patient_id);
	const { data, error } = await db.list(
		'situations_pathologiques',
		[
			['patient_id', patient_id],
			['user_id', get(user).user.id],
			['!sp_id', sp_id]
		],
		{
			selectStatement: get(user).profil?.offre === 'cloud' ? 'sp_id, created_at, encrypted' : '*',
			orderBy: 'created_at'
		}
	);
	console.log('the datas ', data);

	if (error) throw error;
	let sps = data.map((sp) => new SituationPathologique(sp));
	console.log('Les SP mapped', sps);
	return sps;
}
