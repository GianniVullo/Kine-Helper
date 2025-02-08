<script>
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { t } from '../../i18n';
	let { id = 'submit-button', className, children } = $props();
</script>

<button
	{id}
	class="variant-filled-primary btn self-center justify-self-center {className} group"
	type="submit">
	{#if children}
		{@render children()}
	{:else}
		{$t('shared', 'save')}
	{/if}
	<ProgressRadial
		width="w-6 ml-2 group-disabled:inline hidden"
		meter="stroke-secondary-500"
		track="stroke-tertiary-500/30" />
</button>
