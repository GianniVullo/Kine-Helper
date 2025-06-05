<script>
	import ResponsiveSideBar from '../../lib/cloud/components/layout/ResponsiveSideBar.svelte';
	import CommandPalette from '../../lib/cloud/libraries/command-palette/CommandPalette.svelte';
	import BottomRightControlBar from '../../lib/cloud/libraries/History/BottomRightControlBar.svelte';

	let { children } = $props();
</script>

<CommandPalette />

<BottomRightControlBar />

<ResponsiveSideBar {children} />
