<script>
	import { RadioFieldV2, CheckboxFieldV2 } from '../../index';
	import GMFCSScoreField from './GMFCSScoreField.svelte';
	import WarningDisplayer from '../ui/WarningDisplayer.svelte';
	import { patholourdeTypes } from '../../../stores/codeDetails';
	import { t } from '../../../i18n';

	let options = patholourdeTypes().map((value, index) => ({ label: value, value: index }));

	export let pathologieLourde = undefined;
	export let GMFCSScore;
	export let secondeSeance = false;
	export let readOnly = false;
</script>

<div class="max-w-sm">
	<RadioFieldV2
		{readOnly}
		{options}
		bind:value={pathologieLourde}
		name="pathologieLourdeCode"
		label={$t('form.generateur', 'heavy.label')} />
</div>

{#if ['2', '3'].includes(pathologieLourde)}
	<WarningDisplayer descriptionLines={[$t('form.generateur', 'warning5')]} />
{:else if pathologieLourde == '4'}
	<WarningDisplayer
		descriptionLines={[$t('form.generateur', 'warnin7'), $t('form.generateur', 'warning5')]} />
{:else if pathologieLourde == '5'}
	<WarningDisplayer
		descriptionLines={[
			$t('form.generateur', 'warning9'),
			$t('form.generateur', 'warning10'),
			$t('form.generateur', 'warning5')
		]} />
{/if}

{#if pathologieLourde == '0'}
	<CheckboxFieldV2
		{readOnly}
		bind:value={secondeSeance}
		name="secondeSeance"
		label={$t('form.generateur', 'second.label')} />
	<WarningDisplayer descriptionLines={[$t('form.generateur', 'warning12')]} />
{/if}
