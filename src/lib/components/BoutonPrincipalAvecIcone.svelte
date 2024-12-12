<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		icon,
		iconCSS = undefined,
		className = 'inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
	} = $props();

	const iconClassName = '-ml-0.5 mr-1.5 size-5';
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
