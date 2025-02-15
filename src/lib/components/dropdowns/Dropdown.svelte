<script>
	import { onDestroy, onMount } from 'svelte';
	import { simpleDropper } from './DropdownSnippets.svelte';
	import { computePosition, autoUpdate, flip, shift } from '@floating-ui/dom';

	let {
		id = 'dropper-id',
		inner,
		dropper = undefined,
		menuItems = undefined,
		trailing = undefined,
		className = 'ml-3 sm:hidden'
	} = $props();

	let menuState = $state(false);
	let referenceEl;
	let floatingEl;
	let cleanup;

	function clickOutside(node) {
		const handleClick = (event) => {
			if (!node.contains(event.target) && !referenceEl.contains(event.target)) {
				menuState = false;
			}
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
	onMount(() => {
		floatingEl = document.getElementById(id);
		cleanup = autoUpdate(referenceEl, floatingEl, () => {
			computePosition(referenceEl, floatingEl, {
				placement: 'bottom-end',
				middleware: [flip(), shift()],
				strategy: 'fixed'
			}).then((info) => {
				floatingEl.style.left = `${info.x}px`;
				floatingEl.style.top = `${info.y}px`;
			});
		});
	});
	onDestroy(() => {
		cleanup();
	});
</script>

<div bind:this={referenceEl} class="relative {className}">
	<button
		type="button"
		onclick={(e) => {
			if (menuState) {
				console.log('is true');
				menuState = false;
			} else {
				console.log('isFalse');
				menuState = true;
			}
		}}
		class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
		id="mobile-menu-button"
		aria-expanded="false"
		aria-haspopup="true">
		{inner}
		{#if trailing}
			{@render trailing()}
		{:else}
			<svg
				class="-mr-1 ml-1.5 size-5 text-gray-400"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
				data-slot="icon">
				<path
					fill-rule="evenodd"
					d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
					clip-rule="evenodd" />
			</svg>
		{/if}
	</button>
	{#if dropper}
		<div use:clickOutside>{@render dropper(menuItems, menuState, id)}</div>
	{:else}
		<div use:clickOutside>{@render simpleDropper(menuItems, menuState, id)}</div>
	{/if}
</div>
