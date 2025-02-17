<script>
	import { SPSchema, onValid, validateurs, fieldSchema } from './SPSchema';
	import { SubmitButton } from '../../../../forms/index';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import dayjs from 'dayjs';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { onMount } from 'svelte';

	let { patient, sp, mode } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: SPSchema,
		submiter: '#sp-submit',
		initialValues: sp ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: crypto.randomUUID(),
			created_at: dayjs().format('YYYY-MM-DD')
		},
		onValid,
		mode
	});

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form title="Création d'une nouvelle situation pathologique" message={formHandler.message}>
	<FormSection
		titre="Informations générales"
		fields={fieldSchema}
		bind:form={formHandler.form}
		bind:errors={formHandler.errors} />
	<SubmitButton id="sp-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
