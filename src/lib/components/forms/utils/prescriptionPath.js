import { page } from '$app/state';
import { appState } from '../../../managers/AppState.svelte';

export function prescriptionPath() {
	const { patient, sp } = page.data;
	return `${appState.user.id}/patient${
		patient.patient_id
	}/situation-pathologique-${sp.created_at}(${sp.sp_id})/prescriptions`;
}
