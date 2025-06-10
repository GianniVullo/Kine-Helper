<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		icon,
		size = 'lg',
		iconCSS = undefined,
		rtl = false,
		children,
		className = 'inline-flex items-center bg-white text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
	} = $props();

	const sizes = {
		sm: ' rounded px-2 py-1',
		base: ' rounded-md px-2.5 py-1.5',
		lg: ' rounded-md px-3 py-2'
	};

	const iconClassName = `size-5 text-gray-400 ${rtl ? '-mr-0.5 ml-1.5' : '-ml-0.5 mr-1.5'}${iconCSS ? ' ' + iconCSS : ''}`;
</script>

{#if href}
	<a {href} class={[className + sizes[size], rtl ? 'flex-row-reverse' : '']}>
		{@render icon(iconClassName)}
		{#if inner}
			{inner}
		{:else if children}
			{@render children()}
		{/if}
	</a>
{:else}
	<button {onclick} class={[className + sizes[size], rtl ? 'flex-row-reverse' : '']}>
		{@render icon(iconClassName)}
		{#if inner}
			{inner}
		{:else if children}
			{@render children()}
		{/if}
	</button>
{/if}
