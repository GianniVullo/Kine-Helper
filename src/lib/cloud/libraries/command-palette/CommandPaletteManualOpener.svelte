<script>
	import { platform } from '@tauri-apps/plugin-os';
	import { terminal } from 'virtual:terminal';
	let { shrink } = $props();
</script>

<button
	type="button"
	aria-label="Search"
	onclick={(e) => {
		e.stopPropagation();
		window.dispatchEvent(new CustomEvent('command-palette:open'));
		//! to make it autofocus from the manual opener We might be required to use an event listener
		// let input = document.getElementById('command-palette-input');
		// terminal.log('command-palette:open', input.name);
	}}
	class:macos={platform() === 'macos'}
	class={[
		'flex w-36 items-center gap-1 rounded-full bg-gray-50 py-2 inset-ring inset-ring-gray-950/8 lg:w-full',
		shrink ? 'justify-center px-0' : 'px-4'
	]}
	><svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 16 16"
		fill="currentColor"
		aria-hidden="true"
		data-slot="icon"
		class:-ml-0.5={shrink}
		class="size-4 fill-gray-600"
		><path
			fill-rule="evenodd"
			d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
			clip-rule="evenodd"></path
		></svg
	>{#if !shrink}
		<kbd
			class="font-sans text-xs/4 text-gray-500/90 not-in-[.macos]:after:content-['Ctrl_k'] in-[.macos]:after:content-['⌘k']"
			>Recherche : {' '}</kbd>
	{/if}</button>
