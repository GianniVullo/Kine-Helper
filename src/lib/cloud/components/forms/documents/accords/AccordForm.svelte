<script>
	import { Formulaire } from '../../../../libraries/formHandler.svelte';
	import { AccordSchema, fieldSchema, onValid, validateurs } from './AccordSchema.svelte';
	import { t } from '../../../../../i18n';
	import Form from '../../abstract-components/Form.svelte';
	import FormSection from '../../abstract-components/FormSection.svelte';
	import { onMount, tick } from 'svelte';
	import SubmitButton from '../../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../../managers/AppState.svelte';
	import Field from '../../abstract-components/Field.svelte';
	import SituationPathologiqueSelector from '../../../../../forms/documents/SituationPathologiqueSelector.svelte';
	import dayjs from 'dayjs';

	let { patient, sp, docType = 'A', mode = 'create', accord } = $props();

	let formHandler = new Formulaire({
		validateurs,
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
		onValid,
		mode
	});

	onMount(() => {
		formHandler.setup(onValid);
	});
</script>

<Form message={formHandler.message}>
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
	<SubmitButton id="accord-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
