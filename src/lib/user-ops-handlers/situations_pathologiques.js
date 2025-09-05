import { user } from '../stores/UserStore';
import { SituationPathologique } from './models';
import { get } from 'svelte/store';
import { appState } from '../managers/AppState.svelte';


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
