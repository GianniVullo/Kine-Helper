<script>
	import { warningOutlineIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import { t } from '$lib/i18n';
</script>

<div class="px-6 py-14 text-center text-sm sm:px-14">
	{@render warningOutlineIcon('mx-auto size-6 text-gray-400')}
	<p class="mt-4 font-semibold text-gray-900">{$t('commandPalette', 'notFound.title', {}, 'No results')}</p>
	<p class="mt-2 text-gray-500">{$t('commandPalette', 'notFound.description', {}, 'We couldn\'t find anyone with that name. Please try again.')}</p>
</div>
