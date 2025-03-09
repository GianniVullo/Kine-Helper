import { pushState } from '$app/navigation';
import { page } from '$app/state';

class Drawer {
	drawer = $state({
		title: 'Panel title',
		description: 'Get started by filling in the information below to create your new project.',
		component: '',
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
		this.drawer = component;

		pushState('', { ...page.state, drawer: true });
	}

	close() {
		history.back();
		this.drawer = {};
	}
}

export const drawer = new Drawer();
