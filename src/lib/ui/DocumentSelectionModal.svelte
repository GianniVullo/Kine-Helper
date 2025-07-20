<script>
	import { SubmitButton, RadioFieldV2 } from '../forms/index';
	import { page } from '$app/state';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { openDrawer } from '../cloud/libraries/overlays/drawerUtilities.svelte';
	import Form from '../cloud/components/forms/abstract-components/Form.svelte';
	import { Formulaire } from '../cloud/libraries/formHandler.svelte';
	import { length, object, pipe, string } from 'valibot';
	import { goto, replaceState } from '$app/navigation';
	import { cloneDeep } from 'lodash';

	let { accords } = $props();
	const options = [
		{ value: 'A', label: get(t)('shared', 'annexe') + ' A' },
		{ value: 'B', label: get(t)('shared', 'annexe') + ' B' },
		{ value: 'E', label: 'Demande pour Pathologies Lourdes' }
	];

	function onValid(data) {
		console.log('in onValid', data);
		console.log(
			'going to ',
			`/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/documents/create-${data.docType}`
		);
		goto(
			`/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/documents/create-${data.docType}`
			// {
			// 	state: {
			// 		drawer: {
			// 			name: 'accordCreate',
			// 			docType: data.docType,
			// 			accord: cloneDeep(accords.find((a) => a.doc_type === data.docType))
			// 		}
			// 	}
			// }
		);
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
	<SubmitButton id="choose-accord-submit" loading={formHandler.loading}
		>{$t('shared', 'confirm')}</SubmitButton>
</Form>
