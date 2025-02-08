<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { safeParse } from 'valibot';
	import { PatientSchema, fieldSchema, onValid } from './PatientSchema';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';

	let { patient } = $props();

	let formHandler = new Formulaire({
		schema: PatientSchema,
		submiter: '#patient-submit',
		initialValues: patient,
		onValid
	});

	let validationState = $derived(safeParse(PatientSchema, formHandler.form));

	onMount(() => {
		formHandler.setup(onValid);
	});
</script>

<Form title="Création d'un nouveau patient" {validationState}>
	{#snippet inner()}
		{#each fieldSchema as { titre, description, fields }}
			<FormSection {titre} {description} {fields} {validationState} bind:form={formHandler.form} />
		{:else}
			Error : no section!
		{/each}
		<SubmitButton id="patient-submit" className="col-span-full" />
	{/snippet}
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
