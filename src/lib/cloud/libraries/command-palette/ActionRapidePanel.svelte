<script>
	import { platform } from '@tauri-apps/plugin-os';
	import { lightningIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import ActionRapide from '../../components/layout/ActionRapide.svelte';

	let { actionRapides } = $props();
</script>

<div class="px-6 py-14 text-center text-sm sm:px-14">
	{#snippet label()}
		{@render lightningIcon('mx-auto size-6 text-gray-400')}
		<p class="mt-4 font-semibold text-gray-900">Actions Rapides</p>
		<p class="mt-2 inline-block text-left text-xs leading-5 text-gray-500">
			<kbd class="w-auto rounded border border-gray-200 bg-gray-100 px-1 py-0.5">
				{#if platform() == 'macos'}
					<!-- {@render macosCmdKeyIcon('size-3 fill-gray-500 stroke-1 mr-1 ')} -->
					<span class="-mr-1">⌘</span>
					<span>command</span>
				{:else}
					ctrl
				{/if}
			</kbd>
			+
			<kbd class="rounded border border-gray-200 bg-gray-100 px-1 py-0.5">k</kbd>. pour ouvrir la
			fenêtre. <br />
			<kbd class="rounded border border-gray-200 bg-gray-100 px-1 py-0.5">Esc</kbd> pour fermer la
			fenêtre.
			<br />
			<kbd class="rounded border border-gray-200 bg-gray-100 px-1 py-0.5"> Enter</kbd> pour ouvrir le
			premier résultat de la liste.
		</p>
	{/snippet}
	<ActionRapide {actionRapides} {label} />
</div>
