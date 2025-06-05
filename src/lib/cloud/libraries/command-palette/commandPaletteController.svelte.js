import { onMount } from 'svelte';
import { registerShortcut } from '../../../utils/shortcuts';
import { goto } from '$app/navigation';
import { platform } from '@tauri-apps/plugin-os';
import { appState } from '../../../managers/AppState.svelte';
import { on } from 'svelte/events';

export class CommandPaletteController {
	// TODO : La propriété patients devra provenir de appState à l'avenir pour la version cloud
	inner = $state({ opened: false, search: '', patients: [] });
	filteredPatients = $derived.by(() => {
		console.log('Filtering patients with search:', this.inner.search);
		let filtered = this.inner.patients?.filter((patient) => {
			if (!this.inner.search || this.inner.search === '') return false;
			const searchTerm = this.inner.search.toLowerCase();
			if (
				patient.nom.toLowerCase().includes(searchTerm) ||
				patient.prenom?.toLowerCase()?.includes(searchTerm) ||
				patient.localite?.toLowerCase()?.includes(searchTerm) ||
				patient.cp?.toString()?.toLowerCase()?.includes(searchTerm)
			) {
				return true;
			}
		});
		console.log('Filtered patients:', filtered);
		return filtered || [];
	});
	searchInput;
	// These two shortcuts can be unlistened to when the command palette is closed
	closeShortcut;
	gotoPatientShortcut;
	onClickOutside;

	get isMac() {
		return platform() === 'macos';
	}

	constructor() {
		onMount(() => {
			// create an event listener for the command palette open event
			window.addEventListener('command-palette:open', (event) => {
				console.log('Command palette open event received');
				this.inner.opened = true;
				if (this.searchInput) {
					this.searchInput.focus();
				}
			});

			// The main cmd + k open/close command palette shortcut
			// This one needs to always be registered
			registerShortcut((event) => {
				if ((this.isMac ? event.metaKey : event.ctrlKey) && event.key === 'k') {
					event.preventDefault();
					this.inner.opened = !this.inner.opened;
					if (this.inner.opened) {
						this.searchInput?.focus();
					}
				}
			});
		});
		$effect(() => {
			if (this.inner.opened) {
				this.closeShortcut = registerShortcut((event) => {
					console.log('Close shortcut registered');
					if (event.key === 'Escape') {
						this.resetCommandPalette();
					}
				});
				this.gotoPatientShortcut = registerShortcut((event) => {
					if (event.key === 'Enter' && this.inner.search && this.filteredPatients.length > 0) {
						const firstPatient = this.filteredPatients[0];
						this.resetCommandPalette();
						goto(`/dashboard/patients/${firstPatient.patient_id}`);
					}
				});
				this.onClickOutside = on(window, 'click', (event) => {
					console.log('Click outside command palette registered');
					let palette = document.getElementById('command-palette');
					if (!palette.contains(event.target)) {
						this.resetCommandPalette();
					}
				});
				console.log('Command palette opened, shortcuts registered');
			} else {
				if (this.closeShortcut) {
					this.closeShortcut();
					this.closeShortcut = null;
				}
				if (this.gotoPatientShortcut) {
					this.gotoPatientShortcut();
					this.gotoPatientShortcut = null;
				}
				if (this.onClickOutside) {
					this.onClickOutside();
					this.onClickOutside = null;
				}
			}
		});
	}

	resetCommandPalette() {
		this.inner.opened = false;
		this.inner.search = '';
	}

	patientsPromise() {
		return new Promise(async (resolve) => {
			console.log('Fetching patients for command palette...');
			const { data } = await appState.db.select('SELECT * FROM patients WHERE user_id = $1', [
				appState.user.id
			]);
			this.inner.patients = data;
			console.log('Patients fetched:', this.inner.patients);
			resolve();
		});
	}
}
