import { platform } from '@tauri-apps/plugin-os';

export function isMobile() {
	const p = platform();
	return p === 'android' || p === 'ios';
}

export function isDesktop() {
	const p = platform();
	return p === 'windows' || p === 'macos' || p === 'linux';
}

export function isIOS() {
	const p = platform();
	return p === 'ios';
}

export function isMacOS() {
	const p = platform();
	return p === 'macos';
}
