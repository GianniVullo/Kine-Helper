<script>
	import '../app.css';
	import DocumentSelectionModal from '../lib/ui/DocumentSelectionModal.svelte';
	import CalendarEventModal from '../lib/ui/CalendarEventModal.svelte';
	import BugReportModal from '../lib/ui/BugReportModal.svelte';
	import FactureCreationModal from '../lib/ui/FactureCreationModal.svelte';
	import MultipleEventSelectionModal from '../lib/ui/MultipleEventSelectionModal.svelte';
	import { onMount } from 'svelte';
	import SeanceCreationModal from '../lib/ui/SeanceCreationModal.svelte';
	import MarketingModal from '../lib/ui/MarketingModal.svelte';
	import Drawer from '../lib/cloud/libraries/overlays/Drawer.svelte';
	import Notification from '../lib/cloud/libraries/overlays/Notification.svelte';
	import Modal from '$lib/cloud/libraries/overlays/Modal.svelte';

	onMount(() => {
		const myEvent = new CustomEvent('svelteLoaded', {
			detail: { key: 'value' }
		});
		document.dispatchEvent(myEvent);
	});
</script>

<Notification />
<Drawer />
<Modal />
<!-- <Toast position="tr" rounded="rounded-lg" shadow="shadow-xl" /> -->
<!-- <Modal components={modalRegistry} /> -->

<slot />
