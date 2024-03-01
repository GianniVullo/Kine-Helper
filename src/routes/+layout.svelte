<script>
	import '../app.css';
	import { Toast, Modal } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import AttestationModal from '../lib/ui/AttestationModal.svelte';
	import DocumentSelectionModal from '../lib/ui/DocumentSelectionModal.svelte';
	import CodeSelectionModal from '../lib/ui/CodeSelectionModal.svelte';
	import { page } from '$app/stores';
	import CalendarEventModal from '../lib/ui/CalendarEventModal.svelte';
	import { check } from '@tauri-apps/plugin-updater';
	import { relaunch } from '@tauri-apps/plugin-process';
	import { emit } from '@tauri-apps/api/event';
	import { onMount } from 'svelte';
	import BugReportModal from '../lib/ui/BugReportModal.svelte';
	import FactureCreationModal from '../lib/ui/FactureCreationModal.svelte';
	initializeStores();

	// const appWindow = getCurrent();
	// document.getElementById('titlebar-drag').addEventListener('mousedown', () => {
	// 	appWindow.startDragging();
	// });
	// document
	// 	.getElementById('titlebar-minimize')
	// 	.addEventListener('click', () => appWindow.minimize());
	// document
	// 	.getElementById('titlebar-maximize')
	// 	.addEventListener('click', () => appWindow.toggleMaximize());
	// document.getElementById('titlebar-close').addEventListener('click', () => appWindow.close());

	const modalRegistry = {
		// Set a unique modal ID, then pass the component reference
		bugReport: { ref: BugReportModal },
		factureCreation: { ref: FactureCreationModal },
		documentSelection: { ref: DocumentSelectionModal },
		calendarEvent: { ref: CalendarEventModal },
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
	let updateChecked = false;
	onMount(() => {
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		// Dispatching the event from the document
		document.dispatchEvent(myEvent);
		lookingForUpdateAndInstallOrContinue();
	});
	// <!--* Initialization et mise-à-jour de l'application -->
	function lookingForUpdateAndInstallOrContinue() {
		if (updateChecked) {
			return;
		}
		check()
			.then((update) => {
				console.log('update', update);
				// <!--? Si une MAJ est trouvée -->
				if (update?.available) {
					// <!--? ETAPE 1 : il faut envoyer un signal pour mettre à jour le splashscreen -->
					emit('update-status', { status: 'downloading' });

					// <!--? ETAPE 2 : télécharger et installer -->
					update.downloadAndInstall().then(() => {
						// <!--? ETAPE 3 : relancer l'application -->
						relaunch();
					});
				} else {
					// <!--? Si aucune MAJ n'est trouvée -->
					// <!--? Il faut attendre que le DOM soit chargé et alors invoquer la commande -->
					emit('update-status', { status: 'done' });
				}
				updateChecked = true;
			})
			.catch((e) => {
				// <!--? Si aucune MAJ n'est trouvée -->
				// <!--? Il faut attendre que le DOM soit chargé et alors invoquer la commande -->
				console.error('Error while checking for updates', e);
				emit('update-status', { status: 'done' });
				emit('dom-loaded', {});
				updateChecked = true;
			});
		if (document.readyState === 'complete') {
			emit('dom-loaded', {});
		} else {
			document.addEventListener('DOMContentLoaded', () => {
				emit('dom-loaded', {});
			});
		}
	}
</script>

<Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" />
<Modal components={modalRegistry} />

<slot />
