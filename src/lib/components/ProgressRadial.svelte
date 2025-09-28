<script>
	let { className, loading } = $props();
</script>

<div
	class={[
		className,
		'animate-spin rounded-full duration-300',
		!loading ? 'h-0 w-0' : 'ml-2 size-5 border-2 border-indigo-500 border-r-transparent'
	]}>
</div>
