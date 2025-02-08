<script>
	import { beforeNavigate, goto } from '$app/navigation';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let { children } = $props();
	const modalStore = getModalStore();
	beforeNavigate((event) => {
		if (confirmedWantsToLeave || !formHandler.isTainted()) {
			window.onbeforeunload = undefined;
			return;
		}
		event.type === '';
		event.cancel();
		modalStore.trigger({
			type: 'confirm',
			title: 'Attention, vous vous apprêtez à quitter la page',
			body: 'Vous perdrez toutes les modifications non enregistrées. Voulez-vous continuer ?',
			buttonTextCancel: 'Rester sur la page',
			buttonTextConfirm: 'Quitter la page',
			response: (r) => {
				if (r && event.to) {
					confirmedWantsToLeave = true;
					window.onbeforeunload = undefined;
					goto(event.to.url.pathname);
				}
			}
		});
	});
</script>

{@render children()}
