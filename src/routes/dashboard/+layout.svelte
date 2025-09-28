<script>
	import CommandPalette from '../../lib/cloud/libraries/command-palette/CommandPalette.svelte';
	import BottomRightControlBar from '../../lib/cloud/libraries/History/BottomRightControlBar.svelte';
	import AppLayout from '../../lib/components/app-layout/AppLayout.svelte';

	let { children } = $props();
</script>

<CommandPalette />

<BottomRightControlBar />

<AppLayout>
	{@render children()}
</AppLayout>
