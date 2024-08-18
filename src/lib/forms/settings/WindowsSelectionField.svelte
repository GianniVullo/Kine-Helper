<script>
	import { invoke } from '@tauri-apps/api/core';
	import PrinterIcon from '../../ui/svgs/PrinterIcon.svelte';

	let initPrintersAndPlatform = new Promise(async (resolve) => {
		let printers = await invoke('get_printer');
		resolve({ printers });
	});

	export let printerField;
	export let cb = null;
</script>

{#await initPrintersAndPlatform}
	loading...
{:then { printers }}
	<div class="flex flex-wrap overflow-x-scroll">
		{#each printers as printer}
			<button
				on:click={() => {
					printerField = printer.system_name;
					if (cb) {
                        console.log('performing cb');
                        
						cb();
					}
				}}
				class="mb-2 mr-2 flex items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 duration-200 hover:bg-surface-200 dark:bg-surface-800 hover:dark:bg-surface-700">
				<PrinterIcon class="size-5" />
				<div class="flex flex-col items-start">
					<h1 class="select-none text-surface-800 dark:text-surface-100">{printer.name}</h1>
				</div>
				{#if printerField === printer.system_name}
					<div class="ml-1">&#10003;</div>
				{/if}
			</button>
		{/each}
	</div>
{/await}
