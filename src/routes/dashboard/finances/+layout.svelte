<script>
	import { invalidate } from '$app/navigation';
	import { appState } from '../../../lib/managers/AppState.svelte';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { children } = $props();

	const reload = new Promise(async (resolve) => {
		console.log('In reload because appState maybe not good');

		if (!appState.user || !appState.db.db) {
			console.log('It is not good');

			await invalidate('finance:layout');
		}

		resolve();
	});
</script>

{#await reload then _}
	{@render children()}
{/await}
