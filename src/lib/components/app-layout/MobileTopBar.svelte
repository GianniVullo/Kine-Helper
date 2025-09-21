<script>
	import CommandPaletteManualOpener from '../../cloud/libraries/command-palette/CommandPaletteManualOpener.svelte';
	import OrganizationWidget from './OrganizationWidget.svelte';

	let { showDrawer = $bindable(), sidePanel } = $props();
</script>

<div
	class="border-sidebar-500 sticky top-0 z-40 flex items-center justify-between gap-x-6 border-b-2 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
	{#if !showDrawer}
		<button
			onclick={() => {
				showDrawer = true;
			}}
			type="button"
			class="-m-2.5 p-2.5 text-gray-700 lg:hidden">
			<span class="sr-only">Open sidebar</span>
			<svg
				class="size-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
		</button>
	{:else}
		<button
			onclick={() => {
				showDrawer = false;
			}}
			type="button"
			class="-m-2.5 p-2.5">
			<span class="sr-only">Close sidebar</span>
			<svg
				class="size-6 text-black"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
			</svg>
		</button>
	{/if}
	<div class="flex max-w-14 flex-1 items-center text-sm/6 font-semibold text-gray-900">
		<!-- {menuItems.find((p) => p.href === page.url.pathname)?.name} -->
		<CommandPaletteManualOpener shrink={true} />
	</div>
	<h5 class="text-lg font-semibold text-gray-900">Mon cabinet</h5>
	<!-- {@render TeamWidgetMobile()} -->
	<OrganizationWidget {sidePanel} />
</div>
