<script>
	import SidebarMenu from '$lib/SidebarMenu.svelte';
	import { AppShell } from '@skeletonlabs/skeleton';
	let isMinimized = true;
	console.log('in dashboard.layout.svelte');
</script>

<AppShell>
	<!-- (header) -->

	<SidebarMenu {isMinimized} />

	<!-- Router Slot -->
	<div class="ml-0 mt-16 flex p-4 md:ml-12 md:mt-0 flex-col">
		<slot />
	</div>
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!-- (footer) -->
</AppShell>
