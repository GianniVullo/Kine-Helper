<script>
	import { SubmitButton, RadioFieldV2 } from '../forms/index';
	import { page } from '$app/state';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { drawer } from '../cloud/libraries/overlays/drawerUtilities.svelte';
	import AccordForm from '../cloud/components/forms/documents/accords/AccordForm.svelte';
	import Form from '../cloud/components/forms/abstract-components/Form.svelte';
	import { Formulaire } from '../cloud/libraries/formHandler.svelte';
	import { length, object, pipe, string } from 'valibot';
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';

	let { accords } = $props();
	const options = [
		{ value: 'A', label: get(t)('shared', 'annexe') + ' A' },
		{ value: 'B', label: get(t)('shared', 'annexe') + ' B' }
	];

	function onValid(data) {
		console.log(data);
		replaceState('', {
			...page.state,
			modal: undefined
		});
		drawer.trigger({
			title: `Création d'${data.docType === 'A' ? 'une Annexe A' : 'une Annexe B'}`,
			description: 'Panel de contrôle de votre Annexe.',
			component: AccordForm,
			props: {
				patient: page.data.patient,
				sp: page.data.sp,
				docType: data.docType
			},
			meta: { accords }
		});
	}

	const validateurs = {
		docType: pipe(length(1, 1), string())
	};

	let formHandler = new Formulaire({
		validateurs,
		schema: object({
			docType: string()
		}),
		submiter: '#accord-submit',
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

<Form message={formHandler.message}>
	<div class="col-span-full">
		<RadioFieldV2
			bind:value={formHandler.form.docType}
			label={$t('otherModal', 'doc.type')}
			name="docType"
			required
			{options} />
	</div>
	<SubmitButton id="accord-submit">{$t('shared', 'confirm')}</SubmitButton>
</Form>
