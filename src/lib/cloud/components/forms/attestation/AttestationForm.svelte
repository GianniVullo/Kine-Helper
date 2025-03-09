<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { AttestationSchema, fieldSchema, onValid, validateurs } from './AttestationSchema';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import dayjs from 'dayjs';

	let { patient, sp, attestation, seances, mode = "create" } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: AttestationSchema,
		submiter: '#attestation-submit',
		initialValues: attestation ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			created_at: attestation?.created_at ?? dayjs().format(),
			prescription_id: attestation?.prescription_id,
			attestation_id: attestation?.attestation_id ?? crypto.randomUUID(),
			date: attestation?.date ?? dayjs().format('YYYY-MM-DD'),
			porte_prescr:
				attestation?.porte_prescr ?? sp.attestations.reduce((a, b) => a || b.porte_prescr),
			has_been_printed: attestation?.has_been_printed ?? false,
			numero_etablissement: attestation?.numero_etablissement,
			service: attestation?.service,
			total_recu: attestation?.total_recu,
			valeur_totale: attestation?.valeur_totale,
			mutuelle_paid: attestation?.mutuelle_paid ?? false,
			patient_paid: attestation?.patient_paid ?? false
		},
		onValid,
		mode
	});

	onMount(() => {
		formHandler.setup(onValid);
	});
</script>

<Form title="Création d'un nouveau patient" message={formHandler.message}>
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
