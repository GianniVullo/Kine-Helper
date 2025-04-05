<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { PatientSchema, fieldSchema, onValid, validateurs } from './PatientSchema';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import EidReader from '../../../libraries/EIDReader.svelte';

	let { patient, mode = 'create' } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: PatientSchema,
		submiter: '#patient-submit',
		initialValues: {
			user_id: appState.user.id,
			patient_id: crypto.randomUUID(),
			tiers_payant: false,
			ticket_moderateur: true,
			bim: false
		},
		onValid,
		mode
	});

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form title="Création d'un nouveau patient" message={formHandler.message}>
	<EidReader
		dataReceiver={(data) => {
			console.log('data', data);
			for (const field of Object.keys(data)) {
				formHandler.form[field] = data[field];
			}
		}} />
	{#each fieldSchema as { titre, description, fields }}
		<FormSection
			{titre}
			{description}
			{fields}
			bind:form={formHandler.form}
			errors={formHandler.errors} />
	{:else}
		Error : no section!
	{/each}
	<SubmitButton id="patient-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
