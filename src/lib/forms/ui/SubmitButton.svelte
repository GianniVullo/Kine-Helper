<script>
	import { t } from '../../i18n';
	import BoutonPrincipal from '../../components/BoutonPrincipal.svelte';
	import ProgressRadial from './ProgressRadial.svelte';

	let { id = 'submit-button', className, disabled, children, loading } = $props();
	console.log('SubmitButton props:', { id, className, disabled, children, loading });
	
</script>

<BoutonPrincipal disabled={loading || disabled} {id} type="submit">
	<div class="flex items-center justify-center">
		{#if children}
			{@render children()}
		{:else}
			{$t('shared', 'save')}
		{/if}
		<ProgressRadial {loading} />
	</div>
</BoutonPrincipal>
