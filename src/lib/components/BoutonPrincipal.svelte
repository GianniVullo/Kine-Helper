<script>
	let { href = undefined, onclick = undefined, inner } = $props();
	const className =
		'rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
</script>

{#if href}
	<a {href} class={className}>
		{inner}
	</a>
{:else}
	<button {onclick} class={className}>
		{inner}
	</button>
{/if}
