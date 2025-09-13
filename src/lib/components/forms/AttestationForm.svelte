<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { Form, FormSection, Field, SubmitButton } from './blocks';
	import { MoneyField, AttestationPreview } from './fields/index';
	import {
		fieldSchema,
		financeSchema,
		actionFields,
		mutuelleFields,
		financeCheckboxSchema,
		idFields,
		patient_field,
		validateurs,
		AttestationSchema
	} from './schemas/AttestationSchema';
	import { appState } from '../../managers/AppState.svelte';
	import dayjs from 'dayjs';
	import { onAttestationCreate } from './onSubmits.svelte';
	import { platform } from '@tauri-apps/plugin-os';

	let {
		patient,
		sp,
		prescription_id,
		attestation,
		valeur_totale,
		total_recu,
		seances,
		mode = 'create',
		lines,
		numero
	} = $props();

	console.log('START AttestationForm.svelte', lines, seances);
	let formHandler = new Formulaire({
		validateurs,
		schema: AttestationSchema,
		submiter: '#attestation-submit',
		initialValues: {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			created_at: attestation?.created_at ?? dayjs().format('YYYY-MM-DD'),
			date: attestation?.date ?? lines[lines.length - 1].date,
			prescription_id: attestation?.prescription_id ?? prescription_id,
			attestation_id: attestation?.attestation_id ?? crypto.randomUUID(),
			porte_prescr:
				attestation?.porte_prescr ??
				!sp.attestations?.some((a) => a.porte_prescr && a.prescription_id === prescription_id),
			has_been_printed: attestation?.has_been_printed ?? false,
			numero_etablissement: attestation?.numero_etablissement,
			service: attestation?.service,
			total_recu: attestation?.total_recu ?? total_recu,
			valeur_totale: attestation?.valeur_totale ?? valeur_totale,
			mutuelle_paid: attestation?.mutuelle_paid ?? false,
			patient_paid: attestation?.patient_paid ?? false,
			tiers_payant: patient.tiers_payant,
			ticket_moderateur: patient.ticket_moderateur,
			bim: patient.bim,
			lines,
			seances: seances.map((s) => ({
				seance_id: s.seance_id,
				code_id: s.metadata.codes.kine.code_id,
				metadata: s.metadata
			})),
			generateFacturePatient: patient.ticket_moderateur,
			printFacturePatient: patient.ticket_moderateur,
			generateFactureMutuelle: patient.tiers_payant,
			printFactureMutuelle: patient.tiers_payant,
			numero: attestation?.numero ?? numero,
			has_been_printed: attestation?.has_been_printed ?? false,
			organization_id: appState.selectedOrg.id
		},
		onValid: onAttestationCreate,
		mode
	});
	console.log('END AttestationForm.svelte');
	const isMobile = ['ios, android'].includes(platform());
</script>

<Form title="Création d'une nouvelle attestation" message={formHandler.message}>
	{#each idFields as field}
		<Field {field} bind:value={formHandler.form[field.name]} />
	{/each}
	<FormSection
		titre="Actions"
		description="Veuillez sélectionner les actions à effectuer pour cette attestation.">
		{#each actionFields as field}
			{#if !isMobile}
				<Field {field} bind:value={formHandler.form[field.name]} />
			{/if}
		{/each}
		{#if patient.ticket_moderateur}
			{#each patient_field as field}
				{#if !isMobile || field.id !== 'printFacturePatient'}
					<Field {field} bind:value={formHandler.form[field.name]} />
				{/if}
			{/each}
		{/if}
		{#if patient.tiers_payant}
			{#each mutuelleFields as field}
				{#if !isMobile || field.id !== 'printFactureMutuelle'}
					<Field {field} bind:value={formHandler.form[field.name]} />
				{/if}
			{/each}
		{/if}
	</FormSection>
	<FormSection
		titre="Informations générales"
		description="Veuillez renseigner les informations générales de l'attestation.">
		{#each fieldSchema as field}
			<Field
				{field}
				error={formHandler.errors[field.name]}
				bind:value={formHandler.form[field.name]} />
		{/each}
	</FormSection>
	<FormSection
		titre="Informations financières"
		description="Veuillez renseigner les informations sur l'attestation.">
		{#if patient.tiers_payant}
			<Field
				field={financeCheckboxSchema[0]}
				error={formHandler.errors[financeCheckboxSchema[0].name]}
				bind:value={formHandler.form[financeCheckboxSchema[0].name]} />
		{/if}
		{#if patient.ticket_moderateur}
			<Field
				field={financeCheckboxSchema[1]}
				error={formHandler.errors[financeCheckboxSchema[1].name]}
				bind:value={formHandler.form[financeCheckboxSchema[1].name]} />
		{/if}
		{#each financeSchema as field}
			<MoneyField
				formField={formHandler.form[field.name]}
				error={formHandler.errors[field.name]}
				{...field} />
		{/each}
	</FormSection>
	<FormSection titre="Prévisualisation de l'attestation">
		<div class="col-span-full">
			<AttestationPreview {lines}></AttestationPreview>
		</div>
	</FormSection>
	<SubmitButton id="attestation-submit" className="col-span-full" loading={formHandler.loading} />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
