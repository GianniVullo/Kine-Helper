<script>
	import { SubmitButton, RadioFieldV2 } from '../forms/index';
	import { page } from '$app/state';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { openDrawer } from '../cloud/libraries/overlays/drawerUtilities.svelte';
	import Form from '../cloud/components/forms/abstract-components/Form.svelte';
	import { Formulaire } from '../cloud/libraries/formHandler.svelte';
	import { length, object, pipe, string } from 'valibot';
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { cloneDeep } from 'lodash';

	let { accords } = $props();
	const options = [
		{ value: 'A', label: get(t)('shared', 'annexe') + ' A' },
		{ value: 'B', label: get(t)('shared', 'annexe') + ' B' }
	];

	function onValid(data) {
		console.log('in onValid', data);
		console.log('accords', accords);
		replaceState('', {
			...page.state,
			modal: undefined
		});
		openDrawer({
			name: 'accordCreate',
			accord: cloneDeep($state.snapshot(accords)),
			docType: data.docType
		});
	}

	const validateurs = {
		docType: pipe(length(1, 1), string())
	};

	let formHandler = new Formulaire({
		formElement: '#select-accord-type-form',
		validateurs,
		schema: object({
			docType: string()
		}),
		submiter: '#choose-accord-submit',
		initialValues: {
			docType: 'A'
		},
		onValid,
		mode: 'create'
	});

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form id="select-accord-type-form" message={formHandler.message}>
	<div class="col-span-full">
		<RadioFieldV2
			bind:value={formHandler.form.docType}
			label={$t('otherModal', 'doc.type')}
			name="docType"
			required
			{options} />
	</div>
	<SubmitButton id="choose-accord-submit">{$t('shared', 'confirm')}</SubmitButton>
</Form>
