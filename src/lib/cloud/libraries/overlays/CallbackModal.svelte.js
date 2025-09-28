import { pushState } from '$app/navigation';
import { onDestroy } from 'svelte';
import { on } from 'svelte/events';

export class CallBackModal {
	constructor(modal, callback) {
		this.actionId = crypto.randomUUID();
		this.removeEventListener = on(window, `${this.actionId}:Confirmed`, callback);
		this.modal = { ...modal, action: 'signalConfirmation', actionId: this.actionId };
		onDestroy(() => {
			console.log('Destroying the eventilstener from callback modal');
			this.removeEventListener();
		});
	}

	open(e) {
		console.log('OPENING THE MODAL', this.modal);
		e.preventDefault();
		pushState('', { modal: this.modal });
	}
}
