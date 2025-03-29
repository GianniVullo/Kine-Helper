<script>
	import { beforeNavigate, goto, pushState } from '$app/navigation';
	import { page } from '$app/state';

	import Modal from '../../libraries/overlays/Modal.svelte';

	let { children, isDirty } = $props();

	let confirmedWantsToLeave = false;

	beforeNavigate((event) => {
		if (confirmedWantsToLeave || !isDirty) {
			window.onbeforeunload = undefined;
			return;
		}
		event.type === '';
		event.cancel();
		pushState('', {
			...page.state,
			modal: { name: 'exitConfirmation', ...event }
		});
	});
	const modal = {
		type: 'confirm',
		title: 'Attention, vous vous apprêtez à quitter la page',
		body: 'Vous perdrez toutes les modifications non enregistrées. Voulez-vous continuer ?',
		buttonTextCancel: 'Rester sur la page',
		buttonTextConfirm: 'Quitter la page'
	};
</script>

<Modal
	opened={page.state?.modal?.name === 'exitConfirmation'}
	{...modal}
	onAccepted={() => {
		confirmedWantsToLeave = true;
		window.onbeforeunload = undefined;
		goto(page.state.modal.to.url.pathname);
	}} />
{@render children()}
