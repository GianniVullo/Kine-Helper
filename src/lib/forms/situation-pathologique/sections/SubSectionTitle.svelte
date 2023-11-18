<script>
	export let done;
	export let titre;
	export let description;
	let clazz;
	export { clazz as class };
</script>

<div class="mb-4 {clazz}">
	<h3 class="cursor-default select-none text-lg text-secondary-600 dark:text-secondary-400">
		{titre}
		{done ? ' ✓' : ''}
	</h3>
	<p class="cursor-default select-none dark:text-surface-400">
		{@html description}
	</p>
</div>
