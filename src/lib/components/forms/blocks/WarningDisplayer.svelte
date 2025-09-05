<script>
	export let title = 'Attention';
	export let descriptionLines;
</script>

<div class="border-l border-error-600 p-4">
	<h5 class="text-lg text-error-800 dark:text-error-600">{title}</h5>
	{#each descriptionLines as line}
		<p class="text-xsm">
			{line}
		</p>
	{/each}
</div>
