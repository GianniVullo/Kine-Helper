<script>
	import BottomLayout from './BottomLayout.svelte';
	import QueueStateDetailModal from './QueueStateDetailModal.svelte';
	import { appState } from '../../../managers/AppState.svelte';

	let historyManager = appState.queue;
</script>

{#await historyManager.setup() then _}
	<!-- uncomment to test the queue with either a success, failed or paniking async job  -->
	<!-- <TestingController {historyManager} /> -->

	<QueueStateDetailModal {historyManager} />

	{#if historyManager.promiseQueue.length > 0}
		<div class="fixed right-0 bottom-0 h-8 rounded-tl-lg bg-black/80 px-2 py-1 text-white md:w-96 z-50">
			<div class="flex items-center text-sm">
				{#if historyManager.promiseQueue.running}
					<BottomLayout message="Travail en cours..." type="pending" />
				{:else if historyManager.promiseQueue.operations.some((op) => op.status === 'rejected')}
					<BottomLayout message="Erreur" type="error" />
				{:else}
					<BottomLayout message="Aucune tâche en attente" type="completed" />
				{/if}
			</div>
		</div>
	{/if}
{/await}
