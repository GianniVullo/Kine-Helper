<script>
	let { children, titre, actions } = $props();
</script>

<div class="md:flex md:items-center md:justify-between">
	<div class="min-w-0 flex-1">
		<h2 class="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
			{titre}
		</h2>
	</div>
	{@render children?.()}
</div>
