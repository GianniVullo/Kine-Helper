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
	const opsHandler = setupSPOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		let situation_pathologique = new SituationPathologique(data);
		situation_pathologique.upToDate = true;
		await db.save('situations_pathologiques', situation_pathologique.toDB);
		patients.update((patients) => {
			let rpatient = patients.find((p) => p.patient_id == data.patient_id);
			rpatient.situations_pathologiques.push(situation_pathologique);
			return patients;
		});
	});
}

export async function editSituationPathologique(data, seances) {
	const opsHandler = setupSPOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		await db.update(
			'situations_pathologiques',
			[
				['sp_id', data.sp_id],
				['user_id', get(user).user.id]
			],
			data
		);
		patients.update((ps) => {
			let patient = ps.find((p) => p.patient_id === data.patient_id);
			let spIndex = patient.situations_pathologiques.findIndex((sp) => sp.sp_id === data.sp_id);
			patient.situations_pathologiques[spIndex] = {
				...patient.situations_pathologiques[spIndex],
				...data,
				seances: [...patient.situations_pathologiques[spIndex].seances, ...seances]
			};
			return ps;
		});
	});
}

export async function deleteSituationPathologique(data) {
	const opsHandler = setupSPOpsHandler();
	await opsHandler.execute(async () => {
		let db = new DBAdapter();
		await db.delete('situations_pathologiques', [
			['sp_id', data.sp_id],
			['user_id', get(user).user.id]
		]);
		patients.update((p) => {
			let patient = p.find((p) => p.patient_id === data.patient_id);
			patient.situations_pathologiques = patient.situations_pathologiques.filter(
				(sp) => sp.sp_id !== data.sp_id
			);
			return p;
		});
	});
}

export async function retrieveLastSPWithRelatedObjectsPlusOlderSPWithoutRelatedObjects(data) {
	const opsHandler = setupSPOpsHandler();
	await opsHandler.execute(async () => {
		await getLastSpAndOthers(data.patient_id);
	});
}

export async function retrieveSituationPathologique(data) {
	const opsHandler = setupSPOpsHandler();
	let sp;
	await opsHandler.execute(async () => {
		let completedSp = await appState.db.retrieve_sp(data.sp_id);
		completedSp = new SituationPathologique(completedSp.data);
		completedSp.upToDate = true;
		sp = completedSp;
	});
	return sp;
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
