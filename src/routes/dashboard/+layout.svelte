<script>
  import SidebarMenu from "$lib/SidebarMenu.svelte";
  import { AppShell } from "@skeletonlabs/skeleton";
  let isMinimized = true
  console.log('in dashboard.layout.svelte');
</script>

<AppShell>
	<!-- (header) -->

    <SidebarMenu {isMinimized} />

	<!-- Router Slot -->
  <div class="ml-0 mt-16 md:mt-0 md:ml-12">
    <slot />
  </div>
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!-- (footer) -->
</AppShell>
