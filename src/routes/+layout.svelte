<script>
	import '../app.css';
	import '@tailwindplus/elements';
	import { onMount } from 'svelte';
	import Notification from '../lib/cloud/libraries/overlays/Notification.svelte';
	import { onNavigate } from '$app/navigation';
	import { info } from '../lib/cloud/libraries/logging';
	import Dialog from '../lib/cloud/libraries/overlays/Dialog.svelte';

	let { children } = $props();

	onMount(() => {
		info('App layout mounted');
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		document.dispatchEvent(myEvent);
		info('Custom event svelteLoaded dispatched');
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
<Dialog />

{@render children()}
