<script>
	import {
		ArrowCircle,
		errorIcon,
		openOutsideIcon,
		successIcon
	} from '../../../ui/svgs/IconSnippets.svelte';
	import { openModal } from '../overlays/modalUtilities.svelte';

	let { message, type } = $props();
</script>

{#if type === 'pending'}
	{@render ArrowCircle('size-5 stroke-gray-400 animate-spin')}
{:else if type === 'completed'}
	{@render successIcon('size-5 stroke-green-400')}
{:else}
	{@render errorIcon('size-5 stroke-red-400 fill-transparent')}
{/if}
<p class="mx-1 mr-2">{message}</p>
<button class="flex space-x-1" onclick={() => openModal({ name: 'cloudModal' })}>
	<p class="text-sm text-gray-300">voir les détails</p>
	{@render openOutsideIcon('size-5 stroke-gray-400')}
</button>
