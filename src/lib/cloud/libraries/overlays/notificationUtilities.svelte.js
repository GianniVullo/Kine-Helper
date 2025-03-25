import { cloneDeep } from 'lodash';

class Toast {
	fired = $state([]);
	components = [];

	constructor(components) {
		if (components) {
			this.components = components;
		}
	}

	trigger(component) {
		component.id = crypto.randomUUID();
		let cloned = cloneDeep(component);
		this.fired.push(cloned);
		if (cloned.timeout) {
			setTimeout(() => {
				this.close(cloned);
			}, cloned.timeout);
		}
	}

	close(component) {
		let indexOf = this.fired.findIndex((c) => c.id === component.id);
		if (this.fired.find((c) => c.id === component.id)) {
			this.fired.splice(indexOf, 1);
		}
	}
}

export const toast = new Toast();
