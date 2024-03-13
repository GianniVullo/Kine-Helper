<script>
	import SidebarMenu from '$lib/SidebarMenu.svelte';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { user } from '../../lib/stores/UserStore';
	let isMinimized = true;
</script>

<div class="flex md:flex-row flex-col w-screen h-screen">

	<!-- (header) -->
	<SidebarMenu {isMinimized} />
	<!-- Router Slot -->
	<div class="w-full ml-2">
		<slot />
	</div>
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!-- (footer) -->
</div>
