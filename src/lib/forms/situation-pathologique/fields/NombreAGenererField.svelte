<script>
	import DefaultFieldWrapper from '../../abstract-fields/DefaultFieldWrapper.svelte';
	import { t } from '../../../i18n';

	export let dejaFaites;
	export let nombreSeances;
	export let defaultSeanceNumber;
	let previousDejaFaite = 0;
	export let hideDejaFaites = false;
</script>

<div class="flex flex-col space-x-0 space-y-2 md:flex-row md:space-x-2 md:space-y-0">
	<DefaultFieldWrapper
		class="flex flex-col items-start justify-start {hideDejaFaites ? 'hidden' : ''}">
		<p class="select-none text-surface-500 dark:text-surface-300">
			{$t('form.generateur', 'alredaydone.title')}
		</p>
		<div>
			<input
				name="deja_faites"
				type="number"
				min="0"
				max="365"
				bind:value={dejaFaites}
				class="input group-[.has-error]/field:border-error-500" />
		</div>
		<p class="text-surface-800 dark:text-surface-100">
			{@html $t('form.generateur', 'alredaydone.help')}
		</p>
	</DefaultFieldWrapper>

	<DefaultFieldWrapper class="flex flex-col items-start justify-start">
		<p class="select-none text-surface-500 dark:text-surface-300">
			{$t('form.generateur', 'generated')}
		</p>
		<div class="flex space-x-2">
			<input
				name="nombreSeances"
				type="number"
				bind:value={nombreSeances}
				class="input group-[.has-error]/field:border-error-500"
				required
				data-pristine-required-message=""
				on:change />
			<button
				class="variant-ghost-secondary btn"
				on:click|preventDefault={() => defaultSeanceNumber()}>MAX</button>
		</div>
		<p class="text-surface-800 dark:text-surface-100">
			{$t('form.generateur', 'generated.help')}
		</p>
	</DefaultFieldWrapper>
</div>
