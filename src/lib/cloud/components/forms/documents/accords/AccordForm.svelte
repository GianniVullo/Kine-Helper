<script>
	import { Formulaire } from '../../../../libraries/formHandler.svelte';
	import { buildAccordSchema, fieldSchema, onValid } from './AccordSchema.svelte';
	import { t } from '../../../../../i18n';
	import Form from '../../abstract-components/Form.svelte';
	import FormSection from '../../abstract-components/FormSection.svelte';
	import { getContext } from 'svelte';
	import SubmitButton from '../../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../../managers/AppState.svelte';
	import Field from '../../abstract-components/Field.svelte';
	import SituationPathologiqueSelector from '../../../../../forms/documents/SituationPathologiqueSelector.svelte';
	import dayjs from 'dayjs';
	import { page } from '$app/state';

	let { patient, sp, docType, mode = 'create', accord } = $props();

	let { AccordSchema, validateurs } = buildAccordSchema();

	let accords = getContext('accords');

	let formHandler = new Formulaire({
		validateurs,
		formElement: '#accord-form',
		schema: AccordSchema,
		submiter: '#accord-submit',
		scrollable: 'right-drawer',
		initialValues: {
			id: accord?.id ?? crypto.randomUUID(),
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			notification: !sp.accords.some((accord) => accord.metadata.notification),
			date: accord?.date ?? dayjs().format('YYYY-MM-DD'),
			situation: accord?.situation ?? undefined,
			buildable: true,
			metadata: { doc: docType }
		},
		onValid: (data) => {
			console.log('data', data);

			onValid(data, mode);
			accords.push(data);
		},
		mode
	});

	$effect(() => {
		formHandler.form.metadata.doc = page.state?.drawer?.docType;
	});
</script>

<Form id="accord-form" message={formHandler.message}>
	<FormSection
		titre="Informations générales"
		description="Veuillez sélectionner la date et situation pathologique.">
		{#if docType === 'B'}
			<div class="col-span-full">
				<Field
					field={{
						id: 'notification',
						name: 'notification',
						checkboxLabel: 'Première notification',
						checkboxDescription: "Cochez cette option si c'est une première notification",
						inputType: 'checkbox'
					}}
					bind:value={formHandler.form.notification} />
			</div>
		{/if}
		{#each fieldSchema as field}
			<Field {field} bind:value={formHandler.form[field.name]} />
		{/each}
		<div class="col-span-full">
			<SituationPathologiqueSelector
				aOrB={docType}
				bind:value={formHandler.form.situation}
				error={formHandler.errors.situation} />
		</div>
	</FormSection>
	<SubmitButton loading={formHandler.loading} id="accord-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
