<script>
	import { invoke } from '@tauri-apps/api/core';
	import { printerIcon } from '../../../../ui/svgs/IconSnippets.svelte';

	let initPrintersAndPlatform = new Promise(async (resolve) => {
		let printers = await invoke('get_printer');
		resolve({ printers });
	});

	let { printerField = $bindable(), cb } = $props();
</script>

{#await initPrintersAndPlatform}
	loading...
{:then { printers }}
	<div class="flex flex-wrap overflow-x-scroll">
		{#each printers as printer}
			<button
				onclick={() => {
					printerField = printer.system_name;
					if (cb) {
						console.log('performing cb');

						cb();
					}
				}}
				class="hover:bg-surface-200 dark:bg-surface-800 hover:dark:bg-surface-700 mr-2 mb-2 flex items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 duration-200">
				{@render printerIcon('size-5')}
				<div class="flex flex-col items-start">
					<h1 class="text-surface-800 dark:text-surface-100 select-none">{printer.name}</h1>
				</div>
				{#if printerField === printer.system_name}
					<div class="ml-1">&#10003;</div>
				{/if}
			</button>
		{/each}
	</div>
{/await}
