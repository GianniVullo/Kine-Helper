<script>
	let { inner, menuItems = undefined, trailing = undefined } = $props();
	let menuState = $state(false);
</script>

<div class="relative ml-3 sm:hidden">
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

	<!--
    Dropdown menu, show/hide based on menu state.

    Entering: "transition ease-out duration-200"
    From: "transform opacity-0 scale-95"
    To: "transform opacity-100 scale-100"
    Leaving: "transition ease-in duration-75"
    From: "transform opacity-100 scale-100"
    To: "transform opacity-0 scale-95"
    -->
	<div
		class="absolute right-0 z-50 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition duration-200 focus:outline-none {menuState
			? 'scale-100 opacity-100 ease-out'
			: 'scale-95 opacity-0 ease-in pointer-events-none'}"
		role="menu"
		aria-orientation="vertical"
		aria-labelledby="mobile-menu-button"
		tabindex="-1">
		<!-- Active: "bg-gray-100 outline-none", Not Active: "" -->
		{@render menuItems()}
	</div>
</div>
