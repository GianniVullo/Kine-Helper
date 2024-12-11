<script>
	let { href, onclick, name, icon = undefined } = $props();
</script>

{#if onclick}
	<button
		{onclick}
		type="button"
		class="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-200 {icon
			? 'flex items-center space-x-1 justify-center'
			: ''}">
		{#if icon}
			{@render icon()}
		{/if}
		<p class="">{name}</p></button>
{:else}
	<a
		{href}
		class="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-200 {icon
			? 'flex items-center space-x-1 justify-center'
			: ''}">
		{#if icon}
			{@render icon()}
		{/if}
		<p class="">{name}</p></a>
{/if}
