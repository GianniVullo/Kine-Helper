<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte.js';
	// import { t } from '../../i18n';
	import { Form, FormSection, SubmitButton, Field } from './blocks/index';
	import { appState } from '../../managers/AppState.svelte';
	import SituationPathologiqueSelector from './fields/SituationPathologiqueSelector.svelte';
	import dayjs from 'dayjs';
	import { AccordSchema, validateurs, fieldSchema } from './schemas/AccordSchema.svelte.js';
	import { onAccordUpsert } from './onSubmits.svelte.js';
	import { page } from '$app/state';

	let { patient, sp, docType, mode = 'create', accord } = $props();

	let formHandler = new Formulaire({
		validateurs,
		formElement: '#accord-form',
		schema: AccordSchema,
		submiter: '#accord-submit',
		// scrollable: 'right-drawer',
		initialValues: {
			id: accord?.id ?? crypto.randomUUID(),
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			notification: !sp.accords.some((accord) => accord.metadata.notification),
			date: accord?.date ?? dayjs().format('YYYY-MM-DD'),
			situation: accord?.situation ?? undefined,
			buildable: true,
			metadata: { doc: page.params.docType }
		},
		onValid: onAccordUpsert,
		mode
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
