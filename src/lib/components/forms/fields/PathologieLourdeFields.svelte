<script>
	import GMFCSScoreField from './GMFCSScoreField.svelte';
	import WarningDisplayer from '../blocks/WarningDisplayer.svelte';
	import { patholourdeTypes } from '$lib/stores/codeDetails';
	import { t } from '$lib/i18n';
	import Field from '../blocks/Field.svelte';

	let options = patholourdeTypes().map((value, index) => ({ label: value, value: index }));

	let {
		pathologieLourde = $bindable(),
		gmfcs = $bindable(),
		errors,
		secondeSeance = false,
		readOnly = false
	} = $props();

	$effect(() => {
		if (pathologieLourde !== 1) {
			gmfcs = null;
		}
	});
</script>

<div class="max-w-sm">
	<Field
		field={{
			id: 'patho_lourde_type',
			name: 'patho_lourde_type',
			inputType: 'radio',
			readonly: readOnly,
			outerCSS: 'sm:col-span-4',
			innerCSS: '',
			label: $t('form.generateur', 'heavy.label'),
			options
		}}
		bind:value={pathologieLourde}
		error={errors.patho_lourde_type} />
</div>

{#if pathologieLourde === 1}
	<GMFCSScoreField {readOnly} bind:value={gmfcs} />
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
