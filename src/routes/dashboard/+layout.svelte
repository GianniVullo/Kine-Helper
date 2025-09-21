<script>
	import ResponsiveSideBar from '../../lib/cloud/components/layout/ResponsiveSideBar.svelte';
	import CommandPalette from '../../lib/cloud/libraries/command-palette/CommandPalette.svelte';
	import BottomRightControlBar from '../../lib/cloud/libraries/History/BottomRightControlBar.svelte';
	import { terminal } from 'virtual:terminal';
	import AppLayout from '../../lib/components/app-layout/AppLayout.svelte';
	// terminal.log('Dashboard layout loaded');

	let { children } = $props();
</script>

<CommandPalette />

<BottomRightControlBar />

<AppLayout>
	{@render children()}
</AppLayout>
