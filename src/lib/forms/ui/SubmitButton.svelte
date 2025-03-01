<script>
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { t } from '../../i18n';
	import BoutonPrincipal from '../../components/BoutonPrincipal.svelte';
	let { id = 'submit-button', className, disabled, children } = $props();
</script>

<BoutonPrincipal {disabled} {id} type="submit">
	{#if children}
		{@render children()}
	{:else}
		{$t('shared', 'save')}
	{/if}
	<ProgressRadial
		width="w-6 ml-2 group-disabled:inline hidden"
		meter="stroke-secondary-500"
		track="stroke-tertiary-500/30" />
</BoutonPrincipal>
