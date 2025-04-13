<script>
	let { animation = "animate-spin", width = 'size-5', thickness = 'border-2', className } = $props();
</script>

<div
	style="margin: 4px;"
	class={[
		'rounded-full border-blue-300 border-b-pink-500 text-4xl',
		animation,
		width,
		thickness,
		className
	]}>
</div>
