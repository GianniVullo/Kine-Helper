<script>
	import dayjs from 'dayjs';
	import { AsyncQueueManager } from './history-manager/HistoryManager.svelte';
	import { appState } from '../../../managers/AppState.svelte';

	/** @type {{historyManager: AsyncQueueManager}}*/
	let historyManager = appState.queue;
</script>

<button
	class="fixed top-0 right-0 m-2 rounded bg-blue-500 p-2 text-white"
	onclick={async () => {
		await historyManager.addToQueue({
			label: 'TEST',
			job: 'TestSucceeded',
			data: {
				id: crypto.randomUUID(),
				user_id: appState.user.id,
				data: 'Hello World',
				token: 'Hello Token'
			}
		});
	}}>
	TEST
</button>
<button
	class="fixed top-0 right-20 m-2 rounded bg-red-500 p-2 text-white"
	onclick={() => {
		historyManager.promiseQueue.add({
			table: 'Séances',
			action: 'Delete',
			date: dayjs().format('HH:mm'),
			promesse: () => {
				return new Promise((_, reject) => {
					setTimeout(() => {
						console.log('rejecting');
						reject('failed');
					}, 2000);
				});
			}
		});
	}}>
	TEST failed
</button>
