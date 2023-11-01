<script>
	import { page } from '$app/stores';
	import Title from '$lib/patient-detail/Title.svelte';
	import HomeIcon from '$lib/ui/svgs/HomeIcon.svelte';
	export let data;
	const homeUrl = () => {
		return `/dashboard/medical-files/patients/${$page.params.patientId}`;
	};
	$: urlSegments = $page.url.pathname.split('/');
	console.log('fml', $page.url.pathname, urlSegments);
</script>

<div class="flex flex-col items-start justify-start">
	<div>
		<Title {data} homeUrl={homeUrl()} />
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
	</div>
	<slot />
</div>
