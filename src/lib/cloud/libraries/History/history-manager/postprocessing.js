import { supabase } from '../../../../stores/supabaseClient';
import { read_file } from '../../../../utils/fsAccessor';

export async function executePostProcessingJob(job) {
	switch (job.type) {
		case 'CompressAndSendPrescription':
			try {
				let { data, error } = await supabase.storage
					.from('users')
					.upload(
						`${job.filePath}/${job.fileName}`,
						await read_file(`${job.filePath}/${job.fileName}`)
					);
				if (error) {
					console.error('Error uploading file:', error);
				}
				console.log('File uploaded successfully:', data);
			} catch (error) {
				console.error('Error uploading file:', error);
			}
			break;

		default:
			console.warn(`Unknown post-processing job type: ${job.type}`);
			break;
	}
}
