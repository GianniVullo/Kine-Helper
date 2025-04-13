<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		size = 'base',
		children,
		className = 'text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ',
		color = 'primary',
		shadow = 'shadow-sm',
		...rest
	} = $props();

	const sizes = {
		sm: ' rounded px-2 py-1',
		base: ' rounded-md px-2.5 py-1.5',
		lg: ' rounded-md px-3 py-2'
	};
	const colors = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
		error: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
		secondary:
			'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 focus-visible:outline-gray-600',
		tertiary:
			'bg-blue-600 text-white ring-1 ring-blue-300 hover:bg-blue-500 focus-visible:outline-blue-600'
	};
</script>

{#if href}
	<a {href} class={[className, sizes[size], colors[color] || color, shadow]} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{inner}
		{/if}
	</a>
{:else}
	<button {onclick} class={[className, sizes[size], colors[color] || color, shadow]} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{inner}
		{/if}
	</button>
{/if}
