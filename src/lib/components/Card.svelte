<script>
	let { header, body, footer, className } = $props();
</script>

<!-- <div class="overflow-hidden rounded-lg bg-white shadow"></div> -->
<div
	class={[
		'divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10',
		className
	]}>
	{#if header}
		<div class="px-4 py-5 sm:px-6">
			{@render header()}
		</div>
	{/if}
	<div class="px-4 py-5 sm:p-6">
		{@render body()}
	</div>

	{#if footer}
		<div class="px-4 py-4 sm:px-6">
			{@render footer()}
		</div>
	{/if}
</div>
