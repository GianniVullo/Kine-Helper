<script>
	import { beforeNavigate, goto, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { on } from 'svelte/events';

	let { children, isDirty } = $props();

	let confirmedWantsToLeave = false;

	let confirmationevent = on(window, 'exitConfirmation:Confirmed', (e) => {
		confirmedWantsToLeave = true;
		window.onbeforeunload = undefined;
		console.log('THE DETAILS', e.detail);
		goto(e.detail.to);
	});

	beforeNavigate((event) => {
		if (confirmedWantsToLeave || !isDirty) {
			window.onbeforeunload = undefined;
			return;
		}
		event.type === '';
		event.cancel();
		pushState('', {
			...page.state,
			modal: {
				action: 'signalConfirmation',
				actionId: 'exitConfirmation',
				to: event.to.url.pathname,
				title: 'Attention, vous vous apprêtez à quitter la page',
				description:
					'Vous perdrez toutes les modifications non enregistrées. Voulez-vous continuer ?',
				buttonTextCancel: 'Rester sur la page',
				buttonTextConfirm: 'Quitter la page'
			}
		});
	});
	onDestroy(() => {
		// Remove the event listener
		confirmationevent();
	});
</script>

{@render children()}
