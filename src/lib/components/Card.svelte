<script>
	let { header, body } = $props();
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	{#if header}
		<div class="px-4 py-5 sm:px-6">
			{@render header()}
		</div>
	{/if}
	<div class="bg-gray-50 px-4 py-5 sm:p-6">
		{@render body()}
	</div>
</div>
