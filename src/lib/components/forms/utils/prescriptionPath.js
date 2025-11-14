import { page } from '$app/state';
import { platform } from '@tauri-apps/plugin-os';
import { appState } from '../../../managers/AppState.svelte';
import dayjs from 'dayjs';

export function prescriptionPath() {
	const { patient, sp } = page.data;

	return `${appState.user.id}${platform() == 'windows' ? '\\' : '/'}patient${
		patient.patient_id
	}/situation-pathologique-${dayjs(sp.created_at).format('YYYY-MM-DD')}(${sp.sp_id})/prescriptions`;
}
