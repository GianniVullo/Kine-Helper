<script>
	import { platform } from '@tauri-apps/plugin-os';
	import { magnifyingGlassIcon } from '../../../ui/svgs/IconSnippets.svelte';
</script>

<div class="px-6 py-14 text-center text-sm sm:px-14">
	{@render magnifyingGlassIcon('mx-auto size-6 text-gray-400')}
	<p class="mt-4 font-semibold text-gray-900">Aide à la recherche</p>
	<p class="mt-2 inline-block text-gray-500">
		Utilisez cet outil pour accéder à vos dossiers patients depuis n'importe quelle page de Kiné
		Helper en appuyant sur <kbd
			class="w-auto rounded border border-gray-200 bg-gray-100 px-1 py-0.5">
			{#if platform() === 'macos'}
				<!-- {@render macosCmdKeyIcon('size-3 fill-gray-500 stroke-1 mr-1 ')} -->
				<span class="-mr-1">⌘</span>
				<span>command</span>
			{:else}
				ctrl
			{/if}
		</kbd>
		+
		<kbd class="rounded border border-gray-200 bg-gray-100 px-1 py-0.5">k</kbd>. <br /> Insérer simplement
		le nom, le prénom ou un élément de l'adresse d'un patient pour qu'il apparaisse dans la liste des
		résultats.
	</p>
</div>
