<script>
	import { RadioFieldV2 } from '../../index';
	import { t } from '../../../i18n';
	import { get } from 'svelte/store';

	let options = [
		{ value: 1, label: get(t)('form.generateur', 'gmfcs1')},
		{ value: 2, label: get(t)('form.generateur', 'gmfcs2')},
		{ value: 3, label: get(t)('form.generateur', 'gmfcs3')},
		{
			value: 4,
			label:
				get(t)('form.generateur', 'gmfcs4')
		},
		{ value: 5, label: get(t)('form.generateur', 'gmfcs5') }
	];
	export let value;
	export let readOnly = false;
</script>

<RadioFieldV2 {readOnly} bind:value name="gmfcs" {options} label={$t('form.generateur', 'gmfcsScore')} />
