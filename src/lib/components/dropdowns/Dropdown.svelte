<script>
	import { simpleDropper } from './DropdownSnippets.svelte';

	let {
		inner,
		dropper = undefined,
		menuItems = undefined,
		trailing = undefined,
		className = 'ml-3 sm:hidden'
	} = $props();
	let menuState = $state(false);
</script>

<div class="relative {className}">
	<button
		type="button"
		onclick={() => {
			menuState = !menuState;
		}}
		class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
		id="mobile-menu-button"
		aria-expanded="false"
		aria-haspopup="true">
		{inner}
		{#if trailing}
			{@render trailing()}
		{:else}
			<svg
				class="-mr-1 ml-1.5 size-5 text-gray-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd" />
			</svg>
		{/if}
	</button>
	{#if dropper}
		{@render dropper(menuItems, menuState)}
	{:else}
		{@render simpleDropper(menuItems, menuState)}
	{/if}
</div>
