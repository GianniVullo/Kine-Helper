import dayjs from 'dayjs';
import { appState } from '../../../../managers/AppState.svelte';
import { duree_int } from '../../../../stores/codeDetails';
import { getTarificationInitialValues } from '../tarification-fields/tarifHelpers';
import { seanceTypes } from '../validators/specifics/seance';
import { page } from '$app/state';

export function initialSeanceValues({ patient, sp, seance, prescriptions, tarifs, mode }) {
	const tarifMetadata = getTarificationInitialValues(sp, tarifs, seance);
	let fromCalendarDate = page.url.searchParams.get('date');
	let now = dayjs().format('YYYY-MM-DD');
	return {
		user_id: appState.user.id,
		patient_id: patient.patient_id,
		sp_id: sp.sp_id,
		prescription_id:
			(seance?.prescription_id ?? prescriptions.length === 1)
				? prescriptions[0].prescription_id
				: null,
		duree: seance?.duree ?? sp.duree,
		seanceType:
			typeof seance?.seance_type === 'number' ? seanceTypes[seance.seance_type] : undefined,
		lieu_id: seance?.lieu_id ?? sp?.lieu_id,
		start: seance?.start,
		duree_custom:
			seance?.metadata?.duree_custom ?? defineDuree(sp.duree, sp.patho_lourde_type, sp.lieu_id),
		seance_id: seance?.seance_id ?? crypto.randomUUID(),
		created_at: seance?.created_at ?? now,
		date: seance?.date ?? fromCalendarDate ?? now,
		ticket_moderateur: seance?.ticket_moderateur ?? patient.ticket_moderateur ?? true,
		indemnite: seance?.indemnite ?? (sp.lieu_id === 3 || sp.groupe_id === 6 ? true : false),
		rapport_ecrit: seance?.rapport_ecrit ?? false,
		intake: seance?.metadata?.intake ?? false,
		supplements_ponctuels:
			seance?.metadata?.supplements_ponctuels?.map((s) => ({
				id: undefined,
				user_id: undefined,
				created_at: undefined,
				nom: s.nom,
				valeur: s.valeur
			})) ?? [],
		groupe_id: sp.groupe_id,
		patho_lourde_type: sp.patho_lourde_type,
		mode,
		...tarifMetadata,
		supplements: seance?.metadata?.supplements ?? [],
		is_paid: seance?.is_paid ?? false,
		payment_method: seance?.payment_method,
	};
}

export function defineDuree(duree, patho_lourde_type, lieu_id) {
	if (duree) {
		return duree_int(duree);
	}
	if (patho_lourde_type) {
		switch (patho_lourde_type) {
			case 0:
				if ([0, 1, 2, 3, 7].includes(lieu_id)) {
					return 30;
				}
				return 20;
			case 1 || 2:
				return 60;
			case 3:
				return 120;
			case 4:
				return 45;
			case 5:
				return null;
			default:
				break;
		}
	}
	if (patho_lourde_type === 5) {
		return 60;
	}
	return 30;
}

export const payment_methods = ['cash', 'carte', 'virement', 'qrCode'];