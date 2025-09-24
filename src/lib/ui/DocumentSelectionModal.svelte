<script>
	import { page } from '$app/state';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { Form, SubmitButton } from '../components/forms/blocks/index.js';
	import { Formulaire } from '../cloud/libraries/formHandler.svelte';
	import { length, object, pipe, string } from 'valibot';
	import { goto } from '$app/navigation';
	import Field from '../components/forms/blocks/Field.svelte';
	import BoutonPrincipal from '../components/BoutonPrincipal.svelte';
	import { info } from '../cloud/libraries/logging';

	let { accords } = $props();

	const options = [
		{ value: 'A', label: get(t)('shared', 'annexe') + ' A' },
		{ value: 'B', label: get(t)('shared', 'annexe') + ' B' },
		{ value: 'E', label: 'Demande pour Pathologies Lourdes' }
	];

	function onValid(data) {
		info('in onValid', data);
		info(
			'going to ',
			`/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/documents/create-${data.docType}`
		);
		goto(
			`/dashboard/patients/${page.params.patientId}/situation-pathologique/${page.params.spId}/documents/create-${data.docType}`
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
		<Field
			field={{
				label: $t('otherModal', 'doc.type'),
				name: 'docType',
				inputType: 'select',
				help: $t('otherModal', 'doc.type.help'),
				options
			}}
			bind:value={formHandler.form.docType} />
	</div>
	<div class="col-span-full flex items-center justify-around">
		<BoutonPrincipal
			color="secondary"
			onclick={() => {
				history.back();
			}}>
			{$t('shared', 'cancel')}
		</BoutonPrincipal>
		<SubmitButton id="choose-accord-submit" loading={formHandler.loading}
			>{$t('shared', 'confirm')}</SubmitButton>
	</div>
</Form>
