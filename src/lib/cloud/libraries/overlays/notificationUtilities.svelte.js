import { cloneDeep } from 'lodash';
import { errorIcon, successIcon } from '../../../ui/svgs/IconSnippets.svelte';

class Toast {
	fired = $state([]);
	components = [];

	constructor(components) {
		if (components) {
			this.components = components;
		}
	}

	trigger(component) {
		if (component.type) {
			switch (component.type) {
				case 'success':
					component.leading = successIcon;
					component.leadingCSS = 'size-6 text-green-400';
					break;
				case 'error':
					component.leading = errorIcon;
					component.leadingCSS = 'size-6 text-red-600';
				default:
					break;
			}
		}
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
