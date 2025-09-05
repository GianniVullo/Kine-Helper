// import { info as tauriLog } from '@tauri-apps/plugin-log';
import { terminal } from 'virtual:terminal';

export function info(message) {
	try {
		// tauriLog(message);
		terminal.log(message);
	} catch (error) {
		console.error('Logging error:', error);
	}
}
