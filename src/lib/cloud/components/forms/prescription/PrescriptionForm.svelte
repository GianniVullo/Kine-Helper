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

	let { prescription, patient, sp, mode = 'create', title } = $props();

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
	<FormSection
		titre="Informations générales"
		fields={fieldSchemaMode}
		bind:form={formHandler.form}
		bind:errors={formHandler.errors} />
	<SubmitButton id="sp-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
