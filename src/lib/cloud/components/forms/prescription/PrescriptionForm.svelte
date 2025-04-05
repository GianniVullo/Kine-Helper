<script>
	import {
		PrescriptionSchema,
		onValid,
		validateurs,
		fieldSchema
	} from './PrescriptionSchema.svelte';
	import { SubmitButton } from '../../../../forms/index';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import dayjs from 'dayjs';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { onMount } from 'svelte';
	import Field from '../abstract-components/Field.svelte';
	import { get } from 'svelte/store';

	let { prescription, patient, sp, mode = 'create', title } = $props();
	console.log('Prescription', prescription);

	let fieldSchemaMode = fieldSchema(mode);

	let formHandler = new Formulaire({
		validateurs,
		schema: PrescriptionSchema,
		submiter: '#sp-submit',
		initialValues: prescription ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			prescription_id: crypto.randomUUID(),
			created_at: dayjs().format('YYYY-MM-DD')
		},
		onValid,
		mode
	});

	onMount(() => {
		formHandler.setup();
		console.log('The form State = ', formHandler.form);
	});
</script>

<Form title={title ?? $t('prescription.create', 'title')} message={formHandler.message}>
	<FormSection titre="Informations générales">
		{#each fieldSchemaMode as field}
			<Field
				{field}
				error={formHandler.errors[field.name]}
				bind:value={formHandler.form[field.name]} />
		{:else}
			Il n'y a aucun champs à afficher
		{/each}
		<Field
			field={{
				id: 'file',
				name: 'file',
				inputType: 'file',
				titre: `${get(t)('form.prescription', 'copy.label')}${mode === 'update' && prescription.file_name ? `<br /> <span class="text-sm text-gray-400">Actuellement dans la base de donnée : </span><span class ="text-gray-500 text-sm">${prescription.prescripteurNom} ${prescription.prescripteurPrenom} - ${dayjs(prescription.date).format('DD-MM-YYYY')}.${prescription.file_name}</span>` : ''}`,
				outerCSS: 'sm:col-span-full',
				help:
					mode === 'update'
						? 'Attention, si vous uploadez un nouveau fichier la copie de la prescription précédemment enregistrée sera écrasée'
						: undefined
				// innerCSS: ''
			}} />
	</FormSection>
	<SubmitButton id="sp-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
