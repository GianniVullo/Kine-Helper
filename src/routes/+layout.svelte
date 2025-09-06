<script>
	import '../app.css';
	import '@tailwindplus/elements';
	import { onMount } from 'svelte';
	import Notification from '../lib/cloud/libraries/overlays/Notification.svelte';
	import { onNavigate } from '$app/navigation';
	import { terminal } from 'virtual:terminal';
	// import Modal2 from '../lib/cloud/libraries/overlays/Modal2.svelte';

	let { children } = $props();

	onMount(() => {
		terminal.log('App layout mounted');
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		document.dispatchEvent(myEvent);
		terminal.log('Custom event svelteLoaded dispatched');
	});

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

<!-- <Modal2 /> -->
<!-- <Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" /> -->
<!-- <Modal components={modalRegistry} /> -->

{@render children()}
