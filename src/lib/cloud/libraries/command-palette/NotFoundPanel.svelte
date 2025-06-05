<script>
	import { warningOutlineIcon } from '../../../ui/svgs/IconSnippets.svelte';
</script>

<div class="px-6 py-14 text-center text-sm sm:px-14">
	{@render warningOutlineIcon('mx-auto size-6 text-gray-400')}
	<p class="mt-4 font-semibold text-gray-900">Aucun résultat</p>
	<p class="mt-2 text-gray-500">Nous n'avons trouvé personne avec ce nom. Veuillez réessayer.</p>
</div>
