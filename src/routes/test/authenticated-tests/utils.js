import { DatabaseManager } from '../../../lib/cloud/database';

export function treatResponse(response) {
	if (response.error) {
		console.error('Error:', response.error);
		return { success: false, error: response.error };
	}
	if (response.data) {
		console.log('Data:', response.data);
		return { success: true, data: response.data };
	}
	return { success: false, error: 'Unknown response format' };
}

export function cloudManager(offre) {
	appState
	return dbManager;
}
