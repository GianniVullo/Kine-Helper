import { invalidate } from '$app/navigation';
import { trace } from '@tauri-apps/plugin-log';

export async function reloadPatientSpRetrieval(data) {
	console.log('in reloadPatientSpRetrieval with ', data);

	trace('Retrieve patient');
	if (!data.patient || !data.sp) {
		await invalidate('patient:layout');
	}
}
