<script>
	import { buildPrescriptionSchema, onValid, fieldSchema, previousSeancesFields } from './PrescriptionSchema.svelte';
	import { SubmitButton } from '../../../../forms/index';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import dayjs from 'dayjs';
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import Field from '../abstract-components/Field.svelte';
	import PhotocopieField from './PhotocopieField.svelte';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { prescriptionPath } from '../../../../user-ops-handlers/prescriptions';

	let { prescription, patient, sp, mode = 'create', title } = $props();

	let fieldSchemaMode = fieldSchema(mode);

	let { PrescriptionSchema, validateurs } = buildPrescriptionSchema();

	let formHandler = new Formulaire({
		validateurs,
		schema: PrescriptionSchema,
		submiter: '#sp-submit',
		initialValues: prescription ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			prescription_id: crypto.randomUUID(),
			created_at: dayjs().format('YYYY-MM-DD'),
			scans: 0
		},
		onValid,
		mode
	});

	const docNamePromise = new Promise(async (resolve) => {
		resolve(`${await appLocalDataDir()}/${prescriptionPath()}`);
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
	</FormSection>
	<FormSection titre="Séances précédentes" description="Si vous reprenez un traitement entamé par un autre kiné, ces champs permettront à Kiné Helper d'assigner les bons nombres de code de nomenclature à vos séances.">
		{#each previousSeancesFields as field}
			<Field
				{field}
				error={formHandler.errors[field.name]}
				bind:value={formHandler.form[field.name]} />
		{/each}
	</FormSection>
	<FormSection titre="Photocopie" gridCSS="grid gap-x-6 grid-cols-6">
		{#await docNamePromise then documentPath}
			<PhotocopieField
				{prescription}
				{mode}
				documentName={formHandler.form.prescription_id}
				{documentPath}
				bind:value={formHandler.form.file}
				bind:froms={formHandler.form.froms}
				error={formHandler.errors?.file} />
		{/await}
	</FormSection>
	<SubmitButton id="sp-submit" className="col-span-full" loading={formHandler.loading} />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
