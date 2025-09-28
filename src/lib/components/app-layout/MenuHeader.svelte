<script>
	import logo from '$lib/assets/logo.avif';
	import { viewColumnIcon } from '../../ui/svgs/IconSnippets.svelte';
	import CommandPaletteManualOpener from '../../cloud/libraries/command-palette/CommandPaletteManualOpener.svelte';

	let { sidePanel } = $props();
</script>

<div
	class={{
		'flex flex-col px-2': sidePanel.isOpen,
		'mb-5 px-2 pb-4': !sidePanel.isOpen,
		'mb-5 pb-4': true
	}}>
	<div
		class={[
			'grid h-16 shrink-0 grid-cols-6 items-center',
			sidePanel.isOpen ? 'flex-row justify-between' : 'my-5 flex-col items-center space-y-5'
		]}>
		{#if sidePanel.isOpen}
			<img class="col-span-1 h-auto w-auto p-1" src={logo} alt="Kiné Helper" />
		{:else}
			<div
				role="button"
				tabindex="0"
				onmouseover={sidePanel.swapLogoForCollapseButton.bind(sidePanel)}
				onmouseleave={sidePanel.swapCollapseForButton.bind(sidePanel)}
				onfocus={sidePanel.swapLogoForCollapseButton.bind(sidePanel)}
				onblur={sidePanel.swapCollapseForButton.bind(sidePanel)}
				onkeydown={(event) => {
					if (event.key === 'Enter') {
						sidePanel.toggle();
					}
				}}
				class="col-span-full flex w-full items-center justify-center">
				<button
					id="swappable-btn"
					class="flex hidden size-16 cursor-pointer items-center justify-center rounded-full text-white"
					aria-label="Open sidebar"
					onclick={sidePanel.onClickCollapseButton.bind(sidePanel)}
					disabled={sidePanel.loading}>{@render viewColumnIcon('size-5 text-gray-200')}</button>
				<img id="swappable-img" class="h-12" src={logo} alt="Kiné Helper" />
			</div>
		{/if}
		<div class={{ 'col-span-4 overflow-hidden': sidePanel.isOpen, hidden: !sidePanel.isOpen }}>
			<h5
				class="text-center text-xl font-semibold whitespace-nowrap text-gray-800 dark:text-gray-400">
				Kiné Helper
			</h5>
		</div>
		{#if sidePanel.isOpen}
			<button
				onclick={() => sidePanel.toggle()}
				disabled={sidePanel.loading}
				class="col-span-1 flex w-full cursor-pointer items-end justify-end"
				>{@render viewColumnIcon('size-5 text-gray-500 cursor-pointer')}</button>
		{/if}
	</div>
	<CommandPaletteManualOpener shrink={!sidePanel.isOpen} />
</div>
