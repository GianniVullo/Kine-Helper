<script>
	let { href = undefined, onclick = undefined, inner, size = 'base', children, ...rest } = $props();
	const className =
		'bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
	const sizes = {
		sm: ' rounded px-2 py-1',
		base: ' rounded-md px-2.5 py-1.5',
		lg: ' rounded-md px-3 py-2'
	};
</script>

{#if href}
	<a {href} class={className + sizes[size]} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{inner}
		{/if}
	</a>
{:else}
	<button {onclick} class={className + sizes[size]} {...rest}>
		{#if children}
			{@render children()}
		{:else}
			{inner}
		{/if}
	</button>
{/if}
