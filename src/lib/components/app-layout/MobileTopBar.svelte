<script>
	import CommandPaletteManualOpener from '../../cloud/libraries/command-palette/CommandPaletteManualOpener.svelte';
	import { burgerIcon, crossIcon } from '../../ui/svgs/IconSnippets.svelte';
	import OrganizationWidget from './OrganizationWidget.svelte';

	let { showDrawer = $bindable(), sidePanel } = $props();
</script>

<div
	class="border-sidebar-500 sticky top-0 z-40 flex items-center justify-between gap-x-6 border-b bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden dark:bg-gray-900 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:bg-black/10">
	<button
		onclick={() => {
			showDrawer = !showDrawer;
		}}
		type="button"
		class="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-400">
		<span class="sr-only">{showDrawer ? 'close' : 'Open'} sidebar</span>
		{#if showDrawer}
			{@render crossIcon('size-6')}
		{:else}
			{@render burgerIcon('size-6')}
		{/if}
	</button>
	<div class="flex max-w-14 flex-1 items-center text-sm/6 font-semibold text-gray-900">
		<!-- {menuItems.find((p) => p.href === page.url.pathname)?.name} -->
		<CommandPaletteManualOpener shrink={true} />
	</div>
	<h5 class="text-lg font-semibold text-gray-900">Mon cabinet</h5>
	<!-- {@render TeamWidgetMobile()} -->
	<OrganizationWidget {sidePanel} />
</div>
