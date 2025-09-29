// import { info as tauriLog } from '@tauri-apps/plugin-log';
// import { terminal } from 'virtual:terminal';

function stringify(obj) {
	return JSON.stringify(obj);
}

function prettyPrint(obj) {
	return JSON.stringify(obj, null, 2);
}

function stringifyObjs(objs) {
	const obj = objs.length > 1 ? objs.map(stringify).join(' ') : objs[0];
	return typeof obj === 'object' ? `${prettyPrint(obj)}` : obj.toString();
}

export function info(...message) {
	try {
		console.log(stringifyObjs(message));
		// tauriLog(message);
		// terminal.log(message);
	} catch (error) {
		console.error('Logging error:', error);
	}
}

export function warn(...message) {
	try {
		console.warn(stringifyObjs(message));
		// tauriLog(message);
		terminal.warn(message);
	} catch (error) {
		console.error('Logging error:', error);
	}
}

export function error(...message) {
	try {
		console.error(stringifyObjs(message));
		// tauriLog(message);
		terminal.error(message);
	} catch (error) {
		console.error('Logging error:', error);
	}
}
