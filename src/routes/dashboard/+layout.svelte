<script>
	import ResponsiveSideBar from '../../lib/cloud/components/layout/ResponsiveSideBar.svelte';
	import BottomRightControlBar from '../../lib/cloud/libraries/History/BottomRightControlBar.svelte';

	let { children } = $props();
</script>

<BottomRightControlBar />

<ResponsiveSideBar {children} />
