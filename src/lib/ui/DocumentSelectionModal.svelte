<script>
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { FormWrapper, SubmitButton, RadioFieldV2 } from '../forms/index';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { t } from '../i18n';
	import { get } from 'svelte/store';
	import { drawer } from '../cloud/libraries/overlays/drawerUtilities.svelte';
	import AccordForm from '../cloud/components/forms/documents/accords/AccordForm.svelte';
	import Form from '../cloud/components/forms/abstract-components/Form.svelte';
	import { Formulaire } from '../cloud/libraries/formHandler.svelte';
	import { length, object, pipe, string } from 'valibot';
	import { onMount } from 'svelte';

	export let parent;

	const { accords } = $modalStore[0].meta;
	const options = [
		{ value: 'A', label: get(t)('shared', 'annexe') + ' A' },
		{ value: 'B', label: get(t)('shared', 'annexe') + ' B' }
	];

	function onValid(data) {
		console.log();
		modalStore.close();
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

	const cBase = 'card p-4 w-modal shadow-xl space-y-4';

	onMount(() => {
		formHandler.setup();
	});
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<Form title="Sélection du type de document" message={formHandler.message}>
			<!-- <SelectFieldV2 bind:value={formData} label="Types de document" required {options} /> -->
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
	</div>
{/if}
