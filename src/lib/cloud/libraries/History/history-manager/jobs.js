import { invoke } from '@tauri-apps/api/core';
import { supabase } from '../../../../stores/supabaseClient';
import { appState } from '../../../../managers/AppState.svelte';
import { readFile } from '@tauri-apps/plugin-fs';

export async function executeJob(options) {
	switch (options.jobType) {
		case 'CompressAndSendPrescription':
			await invoke('enqueue_job', options);
			if (appState.contrat === 'cloud') {
				const { data: bucket, error: bucketError } = await supabase.storage.getBucket('users');
				if (bucketError) {
					console.error('Error getting bucket:', bucketError);
					return;
				}
				const data = JSON.parse(options.data.data);
				const file = await readFile(data.from);
				const { data: uploadStatus, error: uploadError } = await supabase.storage
					.from('users')
					.upload(`${appState.user.id}/${prescriptions}/${data.file_name}`, file.buffer, {
						contentType: 'image/avif'
					});
				if (uploadError) {
					console.error('Error uploading file:', uploadError);
					return;
				}
			}

			break;

		default:
			await invoke('enqueue_job', options);
			break;
	}
}
