import { invoke } from '@tauri-apps/api/core';

export async function executeJob(options) {
	switch (options.jobType) {
		case 'CompressAndSendPrescription':
			await invoke('enqueue_job', options);
			break;

		default:
			await invoke('enqueue_job', options);
			break;
	}
}
