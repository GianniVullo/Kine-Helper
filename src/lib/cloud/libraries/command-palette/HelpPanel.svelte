<script>
	import { platform } from '@tauri-apps/plugin-os';
	import { boueeIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import { t } from '$lib/i18n';
	import Kbd from '../../../components/KBD.svelte';
</script>

<div class="px-6 py-14 text-center text-sm sm:px-14">
	{@render boueeIcon('mx-auto size-6 text-gray-400')}
	<p class="mt-4 font-semibold text-gray-900">
		{$t('commandPalette', 'help.title', {}, 'Search Help')}
	</p>
	<p class="mt-2 inline-block text-gray-500">
		{$t(
			'commandPalette',
			'help.description',
			{},
			'Use this tool to access your patient files from any page in Kine Helper by pressing'
		)}
		<Kbd
			content={platform() == 'macos'
				? `<span class="-mr-1">⌘ </span><span>${$t('commandPalette', 'help.command', {}, 'command')}</span>`
				: 'ctrl'} />
		+
		<Kbd content="k" />
		{$t(
			'commandPalette',
			'help.searchInstructions',
			{},
			". Simply enter the name, first name, or an element of a patient's address for them to appear in the results list."
		)}
	</p>
</div>
