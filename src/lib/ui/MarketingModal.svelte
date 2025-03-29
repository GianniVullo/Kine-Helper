<script>
	import { t, locale } from '../i18n';
	import { open } from '@tauri-apps/plugin-shell';

	let { pub } = $props();
	console.log(pub.description);
	const description = JSON.parse(pub.description)[$locale.toLowerCase()].split('\\n');
</script>

<div
	class="flex flex-col items-center justify-center {cBase} space-y-10 border border-white px-10 py-10">
	<header>{description[0]}</header>
	<ul class="text-surface-50 space-y-2">
		{#each description.splice(2) as line}
			<li class="">{line}</li>
		{/each}
	</ul>
	<button
		onclick={async () => {
			await open(pub.landing_page_url);
		}}
		class="variant-filled-primary btn btn-lg"
		>{$t('otherModal', 'ourOffer', null, 'Consulter nos offres')}</button>
</div>
