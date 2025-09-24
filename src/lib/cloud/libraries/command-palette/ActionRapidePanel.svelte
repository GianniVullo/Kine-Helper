<script>
	import { platform } from '@tauri-apps/plugin-os';
	import { lightningIcon } from '../../../ui/svgs/IconSnippets.svelte';
	import ActionRapide from '../../components/layout/ActionRapide.svelte';
	import { t } from '$lib/i18n';
	import KBD from '../../../components/KBD.svelte';

	let { actionRapides } = $props();
</script>

<div class="px-6 py-14 text-center text-sm sm:px-14">
	{#snippet label()}
		{@render lightningIcon('mx-auto size-6 text-gray-400')}
		<p class="mt-4 font-semibold text-gray-900 dark:text-white">
			{$t('commandPalette', 'actions.title', {}, 'Quick Actions')}
		</p>
		<p class="mt-2 inline-block text-left text-xs leading-5 text-gray-500">
			<KBD
				content={platform() == 'macos'
					? `<span class="-mr-1">⌘ </span><span>${$t('commandPalette', 'help.command', {}, 'command')}</span>`
					: 'ctrl'} />
			+
			<KBD content="k" />
			{$t('commandPalette', 'actions.openWindow', {}, 'to open the window.')}
			<br />
			<KBD content="Esc" />
			{$t('commandPalette', 'actions.closeWindow', {}, 'to close the window.')}
			<br />
			<KBD content="Enter" />
			{$t('commandPalette', 'actions.openFirst', {}, 'to open the first result in the list.')}
		</p>
	{/snippet}
	<ActionRapide {actionRapides} {label} />
</div>
