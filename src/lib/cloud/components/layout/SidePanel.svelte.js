import { appState } from '../../../managers/AppState.svelte';
import {terminal} from 'virtual:terminal';
export class SidePanel {
	isOpen = $state(true);
	loading = $state(false);
	constructor() {
		this.loading = true;
		appState.db.getItem('sidePanelState').then((state) => {
			if (state !== null) {
				if (typeof state === 'string') {
					state = JSON.parse(state);
				}
				this.isOpen = state;
			}
			this.loading = false;
		});
	}

	toggle() {
		this.loading = true;
		appState.db.setItem('sidePanelState', !this.isOpen).then((state) => {
			this.loading = false;
			this.isOpen = !this.isOpen;
		});
	}
	getSwappables() {
		let swappableBtn = document.getElementById('swappable-btn');
		let swappableImg = document.querySelector('#swappable-img');
		if (swappableBtn && swappableImg) {
			return { swappableBtn, swappableImg };
		}
		return null;
	}
	swapLogoForCollapseButton(event) {
		let { swappableBtn, swappableImg } = this.getSwappables();
		if (swappableBtn && swappableImg) {
			if (event.type === 'mouseover' || event.type === 'focus') {
				swappableBtn.classList.remove('hidden');
				swappableImg.classList.add('hidden');
			}
		}
	}
	swapCollapseForButton(event) {
		let { swappableBtn, swappableImg } = this.getSwappables();
		if (swappableBtn && swappableImg) {
			if (event.type === 'mouseleave' || event.type === 'blur') {
				swappableBtn.classList.add('hidden');
				swappableImg.classList.remove('hidden');
			}
		}
	}
	onClickCollapseButton() {
		let { swappableBtn, swappableImg } = this.getSwappables();
		if (swappableBtn && swappableImg) {
			swappableBtn.classList.add('hidden');
			swappableImg.classList.remove('hidden');
			this.toggle();
		}
	}
}
