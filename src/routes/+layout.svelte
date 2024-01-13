<script>
	import '../app.css';
	import { LightSwitch, Toast, Modal } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { getCurrent } from '@tauri-apps/api/window';
	import AttestationModal from '../lib/ui/AttestationModal.svelte';
	import CodeSelectionModal from '../lib/ui/CodeSelectionModal.svelte';
	import {page} from '$app/stores';

	initializeStores();

	const appWindow = getCurrent();
	document.getElementById('titlebar-drag').addEventListener('mousedown', () => {
		appWindow.startDragging();
	});
	document
		.getElementById('titlebar-minimize')
		.addEventListener('click', () => appWindow.minimize());
	document
		.getElementById('titlebar-maximize')
		.addEventListener('click', () => appWindow.toggleMaximize());
	document.getElementById('titlebar-close').addEventListener('click', () => appWindow.close());

	const modalRegistry = {
	// Set a unique modal ID, then pass the component reference
	attestationCreation: { ref: AttestationModal },
	codeSelection: { ref: CodeSelectionModal }
	// ...
};
	// document.addEventListener(
	// 	'contextmenu',
	// 	function (e) {
	// 		e.preventDefault();
	// 	},
	// 	false
	// );
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	console.log($page);
</script>

<Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" />
<Modal components={modalRegistry} />
<!--! DEBUG STUFF -->
<div class="fixed bottom-0 left-96 flex w-full items-start justify-start">
	<!-- <a class="bg-slate-400 p-2" href="/dashboard">Dashboard</a>
	<a class="bg-slate-400 p-2" href="/">Back to login</a> -->
</div>
<slot />
