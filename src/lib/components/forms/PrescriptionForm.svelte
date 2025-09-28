<script>
	import { PrescriptionSchema, validateurs } from './schemas/PrescriptionSchema';
	import { SubmitButton, Form, FormSection, Field } from './blocks/index';
	import { onPrescriptionUpsert } from './onSubmits.svelte';
	import { t } from '$lib/i18n';
	import dayjs from 'dayjs';
	import { Formulaire } from '$lib/cloud/libraries/formHandler.svelte';
	import { appState } from '$lib/managers/AppState.svelte';
	import PhotocopieField from './fields/PhotocopieField.svelte';
	import { appLocalDataDir } from '@tauri-apps/api/path';
	import { prescriptionPath } from './utils/prescriptionPath';
	import { createRawSnippet } from 'svelte';
	import { get } from 'svelte/store';

	let { prescription, patient, sp, mode = 'create', title } = $props();

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
			scans: 0,
			organization_id: appState.selectedOrg.id
		},
		onValid: onPrescriptionUpsert,
		mode
	});

	const fieldSchemaMode = [
		{
			id: 'file_name',
			name: 'file_name',
			inputType: 'hidden'
		},
		{
			id: 'patient_id',
			name: 'patient_id',
			inputType: 'hidden'
		},
		{
			id: 'user_id',
			name: 'user_id',
			inputType: 'hidden'
		},
		{
			id: 'sp_id',
			name: 'sp_id',
			inputType: 'hidden'
		},
		{
			id: 'prescription_id',
			name: 'prescription_id',
			inputType: 'hidden'
		},
		{
			id: 'created_id',
			name: 'created_id',
			inputType: 'hidden'
		},
		{
			id: 'date',
			name: 'date',
			inputType: 'date',
			placeholder: get(t)('form.prescription', 'date.label'),
			titre: get(t)('form.prescription', 'date.label'),
			help: null,
			outerCSS: 'col-span-full sm:col-span-4',
			innerCSS: ''
		},
		{
			id: 'prescripteurNom',
			name: 'prescripteurNom',
			inputType: 'text',
			placeholder: 'Maison',
			titre: get(t)('form.prescription', 'prescripteurfield.name'),
			help: null,
			outerCSS: 'col-span-full md:col-span-3',
			innerCSS: ''
		},
		{
			id: 'prescripteurPrenom',
			name: 'prescripteurPrenom',
			inputType: 'text',
			placeholder: 'Grégory',
			titre: get(t)('form.prescription', 'prescripteurfield.surname'),
			help: null,
			outerCSS: 'col-span-full md:col-span-3',
			innerCSS: ''
		},
		{
			id: 'prescripteurInami',
			name: 'prescripteurInami',
			inputType: 'text',
			placeholder: get(t)('form.prescription', 'prescripteurfield.inami'),
			titre: get(t)('form.prescription', 'prescripteurfield.inami'),
			help: "Les prescripteurs terminant par '000' ne sont pas autorisés à faire des demandes d'accord",
			outerCSS: 'col-span-full',
			innerCSS: ''
		},
		{
			id: 'nombre_seance',
			name: 'nombre_seance',
			inputType: 'number',
			titre: get(t)('form.prescription', 'nombre_seance.label'),
			help: null,
			outerCSS: 'col-span-3 sm:col-span-2',
			innerCSS: ''
		},
		{
			id: 'seance_par_semaine',
			name: 'seance_par_semaine',
			inputType: 'number',
			titre: get(t)('form.prescription', 'seance_par_semaine.label'),
			removeArrows: true,
			trailing: createRawSnippet(() => ({ render: () => '<p>fois/semaine</p>' })),
			help: null,
			outerCSS: 'col-span-3 sm:col-span-2',
			innerCSS: ''
		}
	];

	export const previousSeancesFields = [
		{
			id: 'jointe_a',
			name: 'jointe_a',
			inputType: 'date',
			titre: get(t)('form.prescription', 'jointe_a.label'),
			help: get(t)('form.prescription', 'jointe_a.help'),
			outerCSS: 'col-span-full md:col-span-3',
			innerCSS: ''
		},
		{
			id: 'deja_faites',
			name: 'deja_faites',
			inputType: 'number',
			titre: 'Séances déjà effectuées',
			help: 'Si vous reprenez le traitement et que le kiné précédent a déjà effectué des séances, mentionnez le nombre ici afin que Kiné Helper puisse attribuer les bons codes à vos séances',
			outerCSS: 'col-span-full md:col-span-3'
		}
	];

	const docNamePromise = new Promise(async (resolve) => {
		resolve(`${await appLocalDataDir()}/${prescriptionPath()}`);
	});
</script>

<Form title={title ?? $t('prescription.create', 'title')} message={formHandler.message}>
	<!-- <PrescripteurField bind:formHandler /> -->
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
	<FormSection
		titre="Séances précédentes"
		description="Si vous reprenez un traitement entamé par un autre kiné, ces champs permettront à Kiné Helper d'assigner les bons nombres de code de nomenclature à vos séances.">
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
