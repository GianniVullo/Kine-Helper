<script>
    import { page } from '$app/stores';
	import ResponsiveSideBar from '../../lib/cloud/components/layout/ResponsiveSideBar.svelte';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
<ResponsiveSideBar />
