<script>
	let { content, className } = $props();
</script>

<kbd
	class={[
		'dark: rounded border border-gray-200 bg-gray-100 px-1 py-0.5 dark:border-gray-800 dark:bg-gray-700 dark:text-gray-300',
		className
	]}>{@html content}</kbd>
