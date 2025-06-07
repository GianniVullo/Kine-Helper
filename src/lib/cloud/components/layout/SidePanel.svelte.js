import { appState } from '../../../managers/AppState.svelte';
export class SidePanel {
	isOpen = $state(true);
	loading = $state(false);
	constructor() {
		this.loading = true;
		appState.db.getItem('sidePanelState').then((state) => {
			console.log('In constructor SidePanel state:', state);
			if (state !== null) {
				if (typeof state === 'string') {
					state = JSON.parse(state);
				}
				console.log('Parsed SidePanel state:', state);
				this.isOpen = state;
			}
			this.loading = false;
		});
	}

	toggle() {
		console.log('Toggling SidePanel state:', this.isOpen);
		this.loading = true;
		appState.db.setItem('sidePanelState', !this.isOpen).then((state) => {
			console.log('SidePanel state saved:', state);
			this.loading = false;
			this.isOpen = !this.isOpen;
		});
	}
}
