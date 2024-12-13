<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		icon,
		size = 'lg',
		iconCSS = undefined,
		className = 'inline-flex items-center bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
	} = $props();

	const sizes = {
		sm: ' rounded px-2 py-1',
		base: ' rounded-md px-2.5 py-1.5',
		lg: ' rounded-md px-3 py-2'
	};

	const iconClassName = '-ml-0.5 mr-1.5 size-5 text-gray-400';
</script>

{#if href}
	<a {href} class={className + sizes[size]}>
		{@render icon(iconClassName)}
		{inner}
	</a>
{:else}
	<button {onclick} class={className + sizes[size]}>
		{@render icon(iconClassName)}
		{inner}
	</button>
{/if}
