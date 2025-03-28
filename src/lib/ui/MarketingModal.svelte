<script>
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { t, locale } from '../i18n';
	import { get } from 'svelte/store';
	import { parse } from 'svelte/compiler';
	import { open } from '@tauri-apps/plugin-shell';

	export let parent;

	const pub = $modalStore[0]?.meta.pub;
	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl';
	const cHeader = 'text-2xl font-bold';
	console.log(pub.description);
	const description = JSON.parse(pub.description)[$locale.toLowerCase()].split('\\n');
</script>

{#if $modalStore[0]}
	<div
		class="flex flex-col items-center justify-center {cBase} space-y-10 border border-white px-10 py-10">
		<header class={cHeader}>{description[0]}</header>
		<ul class="space-y-2 text-surface-50">
			{#each description.splice(2) as line}
				<li class="">{line}</li>
			{/each}
		</ul>
		<button
			on:click={async () => {
				await open(pub.landing_page_url);
			}}
			class="variant-filled-primary btn btn-lg"
			>{$t('otherModal', 'ourOffer', null, 'Consulter nos offres')}</button>
	</div>
{/if}
