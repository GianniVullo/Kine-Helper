<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import Notification from '../lib/cloud/libraries/overlays/Notification.svelte';

	onMount(() => {
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		document.dispatchEvent(myEvent);
	});

	import { onNavigate } from '$app/navigation';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Notification />
<!-- <Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" /> -->
<!-- <Modal components={modalRegistry} /> -->

<slot />
