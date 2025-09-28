<script>
	let { display, color = 'bg-gray-500/25 dark:bg-gray-900/90', z = 'z-50' } = $props();
</script>

<div
	class={[
		'fixed inset-0  transition-opacity',
		display && 'opacity-100 duration-300 ease-out',
		!display && 'pointer-events-none opacity-0 duration-200 ease-in',
		color,
		z
	]}
	aria-hidden="true">
</div>
