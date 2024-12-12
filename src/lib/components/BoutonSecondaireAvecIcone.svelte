<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		icon,
		iconCSS = undefined,
		className = 'inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
	} = $props();

	const iconClassName = '-ml-0.5 mr-1.5 size-5 text-gray-400';
</script>

{#if href}
	<a {href} class={className}>
		{@render icon(iconClassName)}
		{inner}
	</a>
{:else}
	<button {onclick} class={className}>
		{@render icon(iconClassName)}
		{inner}
	</button>
{/if}
