<script module>
	export { dropdownItem };
</script>

{#snippet dropdownItem(href, onclick, inner, cls = 'block px-4 py-2 text-sm text-gray-700')}
	{#if href}
		<a {href} class={cls} role="menuitem" tabindex="-1" id="mobile-menu-item-0">{inner}</a>
	{:else}
		<button {onclick} class={cls} role="menuitem" tabindex="-1" id="mobile-menu-item-0"
			>{inner}</button>
	{/if}
{/snippet}
