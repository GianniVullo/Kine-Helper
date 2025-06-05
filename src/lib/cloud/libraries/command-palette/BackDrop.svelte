<script>
	let { display } = $props();
</script>

<div
	class={[
		'fixed inset-0 z-50 bg-gray-500/25 transition-opacity',
		display && 'opacity-100 duration-300 ease-out',
		!display && 'pointer-events-none opacity-0 duration-200 ease-in'
	]}
	aria-hidden="true">
</div>
