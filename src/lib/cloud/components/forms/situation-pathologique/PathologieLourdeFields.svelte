<script>
	import { RadioFieldV2, CheckboxFieldV2 } from '../../../../forms/index';
	import GMFCSScoreField from './GMFCSScoreField.svelte';
	import WarningDisplayer from './WarningDisplayer.svelte';
	import { patholourdeTypes } from '../../../../stores/codeDetails';
	import { t } from '../../../../i18n';

	let options = patholourdeTypes().map((value, index) => ({ label: value, value: index }));

	let {
		pathologieLourde = $bindable(),
		GMFCSScore,
		errors,
		secondeSeance = false,
		readOnly = false
	} = $props();
</script>

<div class="max-w-sm">
	<RadioFieldV2
		{readOnly}
		{options}
		bind:value={pathologieLourde}
		name="patho_lourde_type"
		label={$t('form.generateur', 'heavy.label')} />
	{#if errors.patho_lourde_type}
		<p class="mt-2 text-sm text-red-600" id="patho_lourde_type-error">
			{@html errors.patho_lourde_type}
		</p>
	{/if}
</div>

{#if pathologieLourde === 1}
	<GMFCSScoreField {readOnly} bind:value={GMFCSScore} />
	{#if errors.gmfcs}
		<p class="mt-2 text-sm text-red-600" id="patho_lourde_type-error">
			{@html errors.gmfcs}
		</p>
	{/if}

	<WarningDisplayer
		descriptionLines={[
			$t('form.generateur', 'warning1'),
			$t('form.generateur', 'warning2'),
			$t('form.generateur', 'warning3'),
			$t('form.generateur', 'warning4'),
			$t('form.generateur', 'warning5')
		]} />
{:else if [2, 3].includes(pathologieLourde)}
	<WarningDisplayer descriptionLines={[$t('form.generateur', 'warning5')]} />
{:else if pathologieLourde == 4}
	<WarningDisplayer
		descriptionLines={[$t('form.generateur', 'warnin7'), $t('form.generateur', 'warning5')]} />
{:else if pathologieLourde == 5}
	<WarningDisplayer
		descriptionLines={[
			$t('form.generateur', 'warning9'),
			$t('form.generateur', 'warning10'),
			$t('form.generateur', 'warning5')
		]} />
{/if}
