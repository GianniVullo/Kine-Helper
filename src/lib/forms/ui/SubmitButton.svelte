<script>
	import { t } from '../../i18n';
	import BoutonPrincipal from '../../components/BoutonPrincipal.svelte';
	import ProgressRadial from './ProgressRadial.svelte';
	let { id = 'submit-button', className, disabled, children } = $props();
</script>

<BoutonPrincipal {disabled} {id} type="submit">
	{#if children}
		{@render children()}
	{:else}
		{$t('shared', 'save')}
	{/if}
	<ProgressRadial />
</BoutonPrincipal>
