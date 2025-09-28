<script>
	import BottomLayout from './BottomLayout.svelte';
	import { appState } from '../../../managers/AppState.svelte';
	import { t } from '$lib/i18n';
	// import TestingController from './TestingController.svelte';

	let historyManager = appState.queue;
</script>

{#await historyManager.setup() then _}
	<!-- uncomment to test the queue with either a success, failed or paniking async job  -->
	<!-- <TestingController {historyManager} /> -->

	{#if historyManager.promiseQueue.operations.length > 0}
		<div class="fixed right-0 bottom-0 h-8 rounded-tl-lg bg-black/80 px-2 py-1 text-white md:w-96 z-50">
			<div class="flex items-center text-sm">
				{#if historyManager.promiseQueue.running}
					<BottomLayout message={$t('queue', 'workInProgress', {}, 'Work in progress...')} type="pending" />
				{:else if historyManager.promiseQueue.operations.some((op) => op.status === 'rejected')}
					<BottomLayout message={$t('queue', 'error', {}, 'Error')} type="error" />
				{:else}
					<BottomLayout message={$t('queue', 'noTasksPending', {}, 'No tasks pending')} type="completed" />
				{/if}
			</div>
		</div>
	{/if}
{/await}
