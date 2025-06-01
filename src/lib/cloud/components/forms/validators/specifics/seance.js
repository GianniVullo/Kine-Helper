import { minLength, partialCheckAsync } from 'valibot';
import { trace, error as errorLog } from '@tauri-apps/plugin-log';
import { appState } from '../../../../../managers/AppState.svelte';

export const seanceTypes = ['kiné', 'consult', 'seconde', 'no-show'];

export const seanceSameDayValidator = partialCheckAsync(
	[['date']],
	async (input) => {
		trace('Checking for seances on the same day');
		let { data, error } = await appState.db.select(
			'SELECT * FROM seances WHERE date(date) = $1 AND sp_id = $2',
			[input.date, input.sp_id]
		);
		if (error) {
			errorLog('Error while checking for seances on the same day ' + error);
			return false;
		}
		if (
			data.length > 1 &&
			typeof input.groupe_id === 'number' &&
			input.groupe_id !== 1 &&
			typeof input.patho_lourde_type === 'number' &&
			input.patho_lourde_type !== 5
		) {
			return false;
		}
		return true;
	},
	'Il y a déjà 2 séances ce jour là !'
);

export const multipleSeanceMinLengthValidator = minLength(
	1,
	'Veuillez ajouter au moins une séance'
);
