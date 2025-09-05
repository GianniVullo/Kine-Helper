<script>
	import Field from '../blocks/Field.svelte';
	import { t } from '$lib/i18n';
	import { get } from 'svelte/store';

	let options = [
		{ value: 1, label: get(t)('form.generateur', 'gmfcs1') },
		{ value: 2, label: get(t)('form.generateur', 'gmfcs2') },
		{ value: 3, label: get(t)('form.generateur', 'gmfcs3') },
		{
			value: 4,
			label: get(t)('form.generateur', 'gmfcs4')
		},
		{ value: 5, label: get(t)('form.generateur', 'gmfcs5') }
	];
	export let value;
	export let readOnly = false;
</script>

<Field
	field={{
		id: 'gmfcs',
		name: 'gmfcs',
		inputType: 'radio',
		readonly: readOnly,
		outerCSS: 'sm:col-span-4',
		innerCSS: '',
		label: get(t)('form.generateur', 'gmfcsScore'),
		options
	}}
	bind:value
	error={errors.gmfcs} />
