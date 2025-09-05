<script>
	import { t } from '$lib/i18n';
	import BoutonPrincipal from '$lib/components/BoutonPrincipal.svelte';
	import ProgressRadial from '$lib/components/ProgressRadial.svelte';

	let { id = 'submit-button', className, disabled, children, loading } = $props();
	console.log('SubmitButton props:', { id, className, disabled, children, loading });
</script>

<BoutonPrincipal {className} disabled={loading || disabled} {id} type="submit">
	<div class="flex items-center justify-center">
		{#if children}
			{@render children()}
		{:else}
			{$t('shared', 'save')}
		{/if}
		<ProgressRadial {loading} />
	</div>
</BoutonPrincipal>
