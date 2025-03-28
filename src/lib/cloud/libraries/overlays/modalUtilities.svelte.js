import { pushState } from '$app/navigation';
import { page } from '$app/state';
import FactureCreationModal from '$lib/ui/FactureCreationModal.svelte';
import { tick } from 'svelte';

class Modal {
	modal = $state({
		title: 'Panel title',
		description: 'Get started by filling in the information below to create your new project.',
		component: undefined,
		meta: undefined
	});
	components = [];
	component;

	constructor(components) {
		if (components) {
			this.components = components;
		}
	}

	trigger(component) {
		this.modal = component;
		pushState('', { ...page.state, modal: true });
	}

	close() {
		history.back();
		tick().then(() => {
			this.modal = {};
		});
	}
}

export const modalStore = new Modal();
