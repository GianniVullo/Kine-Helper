<script>
	import SidebarMenu from '$lib/SidebarMenu.svelte';

	let isMinimized = true;
</script>

<div class="flex h-screen w-screen flex-col md:flex-row">
	<!-- (header) -->
	<SidebarMenu {isMinimized} />
	<!-- Router Slot -->
	<div class="ml-2 w-full">
		<slot />
	</div>
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!-- (footer) -->
</div>
