<script>
	import '../app.css';
	import { Toast, Modal } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import DocumentSelectionModal from '../lib/ui/DocumentSelectionModal.svelte';
	import { page } from '$app/stores';
	import CalendarEventModal from '../lib/ui/CalendarEventModal.svelte';
	import BugReportModal from '../lib/ui/BugReportModal.svelte';
	import FactureCreationModal from '../lib/ui/FactureCreationModal.svelte';
	import { onMount } from 'svelte';
	console.log('page', $page);
	initializeStores();


	const modalRegistry = {
		// Set a unique modal ID, then pass the component reference
		bugReport: { ref: BugReportModal },
		factureCreation: { ref: FactureCreationModal },
		documentSelection: { ref: DocumentSelectionModal },
		calendarEvent: { ref: CalendarEventModal },
		// ...
	};
	onMount(() => {
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		document.dispatchEvent(myEvent);
	})
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	console.log($page);
</script>

<Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" />
<Modal components={modalRegistry} />

<slot />
