<script module>
	export { dropdownItem, dropdownItemWithIcon, simpleDropper, dividerDropper };
</script>

{#snippet dropdownItem(href, onclick, inner, cls = 'block px-4 py-2 text-sm text-gray-700')}
	{#if href}
		<a {href} class={cls} role="menuitem" tabindex="-1">{inner}</a>
	{:else}
		<button {onclick} class={cls} role="menuitem" tabindex="-1">{inner}</button>
	{/if}
{/snippet}

{#snippet dropdownItemWithIcon(
	href,
	onclick,
	inner,
	icon,
	iconClass = 'mr-3 size-5 text-gray-400',
	cls = 'group flex items-center px-4 py-2 text-sm text-gray-700'
)}
	{#if href}
		<a {href} class={cls} role="menuitem" tabindex="-1">
			{@render icon(iconClass)}
			{inner}</a>
	{:else}
		<button {onclick} class={cls} role="menuitem" tabindex="-1">
			{@render icon(iconClass)}
			{inner}</button>
	{/if}
{/snippet}

{#snippet simpleDropper(menuItems, menuState, id = 'dropper-id')}
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
		{id}
		style="width: max-content;"
		class="fixed right-0 z-50 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition duration-200 focus:outline-none {menuState
			? 'scale-100 opacity-100 ease-out'
			: 'pointer-events-none scale-95 opacity-0 ease-in'}"
		role="menu"
		aria-orientation="vertical"
		aria-labelledby="mobile-menu-button"
		tabindex="-1">
		<!-- Active: "bg-gray-100 outline-none", Not Active: "" -->
		{@render menuItems()}
	</div>
{/snippet}

{#snippet dividerDropper(menuItems, menuState, id = 'dropper-id')}
	<!--
    Dropdown menu, show/hide based on menu state.

    same as simple dropper.
    -->
	<div
		{id}
		style="width: max-content;"
		class="fixed right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition duration-200 focus:outline-none {menuState
			? 'scale-100 opacity-100 ease-out'
			: 'pointer-events-none scale-95 opacity-0 ease-in'}"
		role="menu"
		aria-orientation="vertical"
		aria-labelledby="mobile-menu-button"
		tabindex="-1">
		<!-- Active: "bg-gray-100 outline-none", Not Active: "" -->
		{@render menuItems()}
	</div>
{/snippet}
