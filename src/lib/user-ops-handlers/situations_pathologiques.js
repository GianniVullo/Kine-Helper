import { user } from '../stores/UserStore';
import { SituationPathologique } from './models';
import { get } from 'svelte/store';
import { appState } from '../managers/AppState.svelte';

export async function createSituationPathologique(data) {
	return await appState.db.insert('situations_pathologiques', data);
}

export async function editSituationPathologique(data, sp_id) {
	return await appState.db.update('situations_pathologiques', [['sp_id', sp_id]], data);
}

export async function deleteSituationPathologique(data) {
		await appState.db.delete('situations_pathologiques', [
			['sp_id', data.sp_id],
		]);
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
