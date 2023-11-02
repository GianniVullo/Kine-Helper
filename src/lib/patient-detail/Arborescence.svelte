<script>
	import { page } from '$app/stores';
	import HomeIcon from '$lib/ui/svgs/HomeIcon.svelte';
	import FolderIcon from '$lib/ui/svgs/FolderIcon.svelte';
	import PageIcon from '$lib/ui/svgs/PageIcon.svelte';
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import ChevronLeftIcon from '../ui/svgs/ChevronLeftIcon.svelte';
	import ChevronRightIcon from '../ui/svgs/ChevronRightIcon.svelte';

	export let patient;
	const homeUrl = () => {
		return `/dashboard/patients/${$page.params.patientId}`;
	};
	let open = true;
	$: urlSegments = $page.url.pathname.split('/');
	$: patientTree = urlSegments[urlSegments.length - 1];
	console.log(patientTree, urlSegments, $page.url.pathname.split('/'));
</script>

<div
	data-open={open}
	class="group relative -ml-4 mr-4 h-full rounded-r-[40px] border-r border-surface-200 p-2 shadow duration-200 data-[open=false]:h-10 data-[open=true]:h-1/6 data-[open=false]:bg-surface-200 data-[open=true]:bg-surface-300 data-[open=true]:dark:bg-surface-600 data-[open=false]:dark:bg-surface-800 data-[open=false]:md:h-full data-[open=true]:md:h-full data-[open=false]:md:w-10 data-[open=true]:md:w-1/6">
	<button
		class="btn absolute group-data-[open=false]:-left-2 group-data-[open=true]:right-0 group-data-[open=false]:md:-left-2 group-data-[open=true]:md:right-0"
		on:click={() => (open = !open)}>
		{#if open}
			<ChevronLeftIcon class="h-6 w-6" />
		{:else}
			<ChevronRightIcon class="h-6 w-6" />
		{/if}
	</button>
	<h3 class="ml-2 mt-2 text-surface-500 dark:text-surface-300 group-data-[open=false]:hidden">Arborescence</h3>
	<TreeView
		width="w-full group-data-[open=false]:hidden"
		hyphenOpacity="hidden"
		indent="ml-2"
		padding="px-2 py-1"
		caretClosed="-rotate-90"
		caretOpen="rotate-0">
		{#each patient.situation_pathologiques ?? [] as sp, idx}
			<TreeViewItem spacing="space-x-2 mt-2" open={idx == 0}>
				<svelte:fragment slot="lead">
					<FolderIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
				</svelte:fragment>
				<h5 class="text-surface-600 dark:text-surface-200">
					Situation du {new Date(sp.created_at).toLocaleDateString()}
				</h5>
				<svelte:fragment slot="children">
					<TreeViewItem>
						<h5 class="text-surface-700 dark:text-surface-100">Prescriptions</h5>
						<svelte:fragment slot="lead">
							<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
						</svelte:fragment>
					</TreeViewItem>
					<TreeViewItem>
						<h5 class="text-surface-700 dark:text-surface-100">Documents</h5>
						<svelte:fragment slot="lead">
							<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
						</svelte:fragment>
					</TreeViewItem>
					<TreeViewItem>
						<h5 class="text-surface-700 dark:text-surface-100">Séances</h5>
						<svelte:fragment slot="lead">
							<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
						</svelte:fragment>
					</TreeViewItem>
					<TreeViewItem>
						<h5 class="text-surface-700 dark:text-surface-100">Attestations</h5>
						<svelte:fragment slot="lead">
							<PageIcon class="h-5 w-5 fill-surface-700 dark:fill-surface-300" />
						</svelte:fragment>
					</TreeViewItem>
				</svelte:fragment>
			</TreeViewItem>
		{/each}
	</TreeView>
</div>

{#if urlSegments.length > 5}
	<div class="flex items-end justify-start">
		<a href={homeUrl()}>
			<HomeIcon class="h-6 w-6" />
		</a>
		{#each urlSegments as segment, idx}
			{#if idx > 4}
				<p class="mx-2">/</p>
				{#if idx == urlSegments.length - 1}
					<div>{segment}</div>
				{:else}
					<a href="/">{segment}</a>
				{/if}
			{/if}
		{/each}
	</div>
{/if}

<style>
	/* your styles go here */
</style>
