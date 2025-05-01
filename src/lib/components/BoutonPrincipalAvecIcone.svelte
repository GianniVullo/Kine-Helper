<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		icon,
		size = 'lg',
		iconCSS = undefined,
		className = 'inline-flex items-center bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
	} = $props();

	const sizes = {
		sm: ' rounded px-2 py-1',
		base: ' rounded-md px-2.5 py-1.5',
		lg: ' rounded-md px-3 py-2'
	};

	const iconClassName = '-ml-0.5 mr-1.5 size-5';
</script>

{#if href}
	<a {href} class={className + sizes[size]}>
		{@render icon(iconClassName)}
		{@html inner}
	</a>
{:else}
	<button {onclick} class={className + sizes[size]}>
		{@render icon(iconClassName)}
		{@html inner}
	</button>
{/if}
