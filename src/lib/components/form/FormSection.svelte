<script>
	let { titre, description, fields, withGrid = true } = $props();
</script>

<div class="border-b border-gray-900/10 pb-12">
	<h2 class="text-base/7 font-semibold text-gray-900">{titre}</h2>
	{#if description}
		<p class="mt-1 text-sm/6 text-gray-600">
			{description}
		</p>
	{/if}
	<div class="mt-10 {withGrid ? 'grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6' : 'space-y-10'}">
		{@render fields()}
	</div>
</div>
