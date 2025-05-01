import { listen } from '@tauri-apps/api/event';
import { platform } from '@tauri-apps/plugin-os';
import { onDestroy } from 'svelte';
import { appState } from '../../../managers/AppState.svelte';
import { invoke } from '@tauri-apps/api/core';

export class ScannerAPI {
	scanners = $state([]);
	defaultScanner = $state();
	selectedScanner = $state();

	constructor() {
		if (platform() === 'macos') {
			this.unlisten = null;
			this.unlistenScanProgress = null;
			this.unlistenRemovedDevice = null;
			this.unlistenScanError = null;
			this.unlistenScan = null;

			onDestroy(() => {
				if (this.unlisten) this.unlisten();
				if (this.unlistenScan) this.unlistenScan();
				if (this.unlistenScanProgress) this.unlistenScanProgress();
				if (this.unlistenRemovedDevice) this.unlistenRemovedDevice();
				if (this.unlistenScanError) this.unlistenScanError();
			});
		}
	}

	lookingForScanners() {
		return new Promise((resolve, reject) => {
			if (platform() === 'macos') {
				this.appleImageCaptureCoreAPI(resolve, reject);
			}
			if (platform() === 'windows') {
				this.windowsScannerAPI(resolve, reject);
			}
		});
	}

	async scan(documentName, documentPath, afterScan, onerror) {
		if (platform() === 'macos') {
			return await this.macos_get_scan(documentName, documentPath, afterScan, onerror);
		}
		if (platform() === 'windows') {
			return await this.windows_get_scan(documentName, documentPath, afterScan, onerror);
		}
	}

	async appleImageCaptureCoreAPI(resolve, reject) {
		if (!this.unlisten) {
			this.unlisten = await listen('added_device', async (event) => {
				console.log('Scanner found:', event.payload);
				const iterationDone = event.payload.endsWith('-end');
				const scanner = iterationDone ? event.payload.replace('-end', '') : event.payload;
				if (!this.scanners.includes(scanner)) {
					this.scanners.push(scanner);
				}
				if (iterationDone) {
					clearTimeout();
					if (this.scanners.length === 1) {
						this.selectedScanner = this.scanners[0];
					}
					resolve();
				}
				console.log(event);
			});
		}
		if (!this.unlistenRemovedDevice) {
			this.unlistenRemovedDevice = await listen('removed_device', async (event) => {
				console.log('Scanner removed:', event.payload);
				const scanner = event.payload;
				this.scanners = this.scanners.filter((s) => s !== scanner);
				if (this.scanners.length === 0) {
					this.selectedScanner = null;
				}
			});
		}
		this.scanners = [];
		this.defaultScanner = await appState.db.getItem('defaultScanner');
		try {
			let res = await invoke('get_scanners');
			if (res.length > 0) {
				this.scanners = res;
				if (this.scanners.length === 1) {
					this.selectedScanner = this.scanners[0];
				}
				resolve();
			}
		} catch (error) {
			reject(error);
		}
	}

	async windowsScannerAPI(resolve, reject) {
		try {
			this.scanners = await invoke('get_scanners');
			resolve();
		} catch (error) {
			reject(error);
		}
	}

	async windows_get_scan(documentName, documentPath, afterScan, onerror) {
		try {
			const scan = await invoke('get_scan', {
				scanOpsRelatedInfo: {
					scanner_name: $state.snapshot(this.selectedScanner),
					document_name: documentName,
					document_path: documentPath
				}
			});
			afterScan(scan);
		} catch (error) {
			onerror(error);
		}
	}

	async macos_get_scan(documentName, documentPath, afterScan, onerror) {
		this.unlistenScan = await listen('scan_done', async (event) => {
			console.log('Scan done:', event.payload);
			afterScan(event.payload);
		});
		this.unlistenScanProgress = await listen('scanner_session_opened', async (event) => {
			console.log('Scanner session opened:', event.payload);
		});
		this.unlistenScanError = await listen('scan_error', (event) => {
			onerror(event.payload);
		});
		let status = await invoke('get_scan', {
			scanOpsRelatedInfo: {
				scanner_name: $state.snapshot(this.selectedScanner),
				document_name: documentName,
				document_path: documentPath
			}
		});
	}
}
