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
	import dayjs from 'dayjs';

	let { patient, mode = 'create' } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: PatientSchema,
		submiter: '#patient-submit',
		initialValues: {
			user_id: patient?.user_id ?? appState.user.id,
			patient_id: patient?.patient_id ?? crypto.randomUUID(),
			nom: patient?.nom,
			prenom: patient?.prenom,
			niss: patient?.niss,
			date_naissance: patient?.date_naissance,
			sexe: patient?.sexe,
			adresse: patient?.adresse,
			cp: patient?.cp,
			localite: patient?.localite,
			num_affilie: patient?.num_affilie,
			tiers_payant: patient?.tiers_payant ?? false,
			ticket_moderateur: patient?.ticket_moderateur ?? true,
			bim: patient?.bim ?? false,
			mutualite: patient?.mutualite,
			email: patient?.email,
			tel: patient?.tel,
			gsm: patient?.gsm
		},
		onValid,
		mode
	});

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form
	title={mode === 'create' ? "Création d'un nouveau patient" : 'Modification du patient'}
	message={formHandler.message}>
	{#if mode === 'create'}
		<EidReader
			dataReceiver={(data) => {
				console.log('data', data);
				for (const field of Object.keys(data)) {
					formHandler.form[field] = data[field];
				}
			}} />
	{/if}
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
	<SubmitButton id="patient-submit" className="col-span-full" loading={formHandler.loading} />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
