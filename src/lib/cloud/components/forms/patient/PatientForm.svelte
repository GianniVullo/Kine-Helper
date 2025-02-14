<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { PatientSchema, fieldSchema, onValid, validateurs } from './PatientSchema';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';

	let { patient } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: PatientSchema,
		submiter: '#patient-submit',
		initialValues: patient ?? { user_id: appState.user.id, patient_id: crypto.randomUUID(), tiers_payant: false, ticket_moderateur: true, bim: false },
		onValid
	});

	onMount(() => {
		formHandler.setup(onValid);
	});
</script>

<Form title="Création d'un nouveau patient" message={formHandler.message}>
	{#each fieldSchema as { titre, description, fields }}
		<FormSection {titre} {description} {fields} bind:form={formHandler.form} bind:errors={formHandler.errors} />
	{:else}
		Error : no section!
	{/each}
	<SubmitButton id="patient-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
