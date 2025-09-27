<script>
	import { createRawSnippet } from 'svelte';
	import { appState } from '../../managers/AppState.svelte';
	import { chevronRightIcon, cogIcon } from '../../ui/svgs/IconSnippets.svelte';
	import TwDropdown from '../TWElements/TWDropdown.svelte';
	import { t } from '../../i18n';
	import { goto } from '$app/navigation';

	let { sidePanel } = $props();
	let selectedOrg = $derived(appState.organizations.find((o) => o.selected));
</script>

{#snippet logoOrDefault(org, { className } = {})}
	{#if org?.logo}
		{@const logoUrl = URL.createObjectURL(
			new Blob([new Uint8Array($state.snapshot(org.logo))], { type: 'image/png' })
		)}
		<img src={logoUrl} alt="" class={[className, 'hidden size-8 md:inline']} />
	{:else}
		<div
			class="flex size-8 items-center justify-center rounded-full bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
			alt="">
			N.D.
		</div>
	{/if}
	<span class="sr-only">Selected Organization</span>
	{#if sidePanel.isOpen}
		<span
			class={[
				'hidden text-xs text-gray-900 md:inline-block dark:text-gray-400 dark:group-hover:text-gray-300',
				!sidePanel.isOpen && 'md:!hidden'
			]}>{org.name}</span>
	{/if}
{/snippet}

<li
	class="group -mx-6 mt-auto list-none duration-300 md:grid md:grid-cols-6 md:hover:border-t md:hover:border-t-gray-400 dark:border-t dark:border-gray-800 dark:group-hover:bg-gray-700 dark:md:hover:border-t-gray-700">
	<a
		href="/dashboard/settings/organisation"
		class={[
			'hidden items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 duration-300 group-hover:bg-gray-50 md:col-span-5 md:flex dark:border-gray-800 dark:group-hover:bg-gray-800',
			!sidePanel.isOpen && 'md:!hidden'
		]}>
		{@render logoOrDefault(selectedOrg)}
	</a>
	<TwDropdown
		className={sidePanel.isOpen ? 'md:col-span-1' : 'md:col-span-full'}
		items={[
			...appState.organizations.map((o) => [
				{
					id: o.id,
					label: o.name,
					onclick: () => {
						console.log('IN ORGWIDGET ONCLICK WITH ', o);
						appState.setOrg(o.id);
					},
					icon: createRawSnippet(() => ({
						render: () => {
							if (!o.selected && o.logo) {
								return `<img id="${o.id}" class="size-5" src="" alt="" />`;
							} else if (o.selected) {
								return '✅';
							}
							return '';
						},
						setup: (node) => {
							$effect(() => {
								const bytes = new Uint8Array($state.snapshot(o.logo));
								const blob = new Blob([bytes], { type: 'image/avif' });
								const url = URL.createObjectURL(blob);
								node.src = url;
							});
						}
					}))
				}
			]),
			[
				{
					id: 'None',
					label: $t('org', 'gotoSettings', null, 'Préférences'),
					icon: cogIcon,
					actionCSS: `${sidePanel.isOpen && 'md:hidden'}`,
					onclick: () => goto('/dashboard/settings/organisation')
				}
			]
		]}>
		{#snippet customTrigger()}
			<button
				class={[
					'flex h-full w-full items-center justify-center pr-4 duration-300 md:border-l md:border-gray-300 md:pr-0 md:group-hover:border-gray-500 md:group-hover:bg-gray-300 md:hover:bg-gray-200 dark:md:border-gray-800 dark:md:group-hover:bg-gray-800',
					!sidePanel.isOpen && 'md:py-4'
				]}>
				<div class={['inline', sidePanel.isOpen && 'md:hidden']}>
					{@render logoOrDefault(selectedOrg, {
						className: `inline ${sidePanel.isOpen && 'md:hidden'} size-8`
					})}
				</div>
				{@render chevronRightIcon(
					`rotate-270 size-10 group-hover:text-gray-400 text-gray-300 hidden duration-300 dark:text-gray-500 ${!sidePanel.isOpen ? 'md:!hidden' : 'md:inline'}`
				)}
			</button>
		{/snippet}
	</TwDropdown>
</li>
