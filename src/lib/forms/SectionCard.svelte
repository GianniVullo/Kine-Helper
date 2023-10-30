<script>
	export let label = undefined;
</script>

<div class="border-l w-full border-l-primary-500 bg-surface-100 dark:bg-surface-800 p-4 group-[.isLoading]/form:opacity-60" style="border-radius: 40px; border-bottom-right-radius: 40px; border-top-right-radius: 40px;">
	{#if label}
		<h1 class="text-sm order text-primary-500 dark:text-primary-400">{label}</h1>
	{/if}
	<div class="space-y-2 p-4">
		<slot />
	</div>
</div>
