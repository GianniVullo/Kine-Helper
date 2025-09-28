<script>
	let {
		href = undefined,
		onclick = undefined,
		inner,
		size = 'base',
		children,
		className = 'text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:!cursor-not-allowed',
		color = 'primary',
		shadow = 'shadow-sm',
		disabled,
		...rest
	} = $props();

	const sizes = {
		sm: ' rounded px-2 py-1',
		base: ' rounded-md px-2.5 py-1.5',
		lg: ' rounded-md px-3 py-2'
	};

	const colors = {
		primary:
			'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 dark:disabled:text-gray-400',
		error:
			'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 disabled:bg-red-300  dark:disabled:bg-red-900 dark:disabled:text-red-400',
		secondary:
			'inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20',
		tertiary:
			'bg-blue-600 text-white ring-1 ring-blue-300 hover:bg-blue-500 focus-visible:outline-blue-600 disabled:bg-blue-300  dark:disabled:bg-blue-900 dark:disabled:text-blue-400'
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
	<button
		{disabled}
		{onclick}
		class={[className, sizes[size], colors[color] || color, shadow]}
		{...rest}>
		{#if children}
			{@render children()}
		{:else}
			{inner}
		{/if}
	</button>
{/if}
