<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import { buildPatientSchema, fieldSchema, onValid } from './PatientSchema';
	import { t } from '../../../../i18n';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import EidReader from '../../../libraries/EIDReader.svelte';
	import { untrack } from 'svelte';
	import dayjs from 'dayjs';

	let { patient, mode = 'create' } = $props();

	let { PatientSchema, validateurs } = buildPatientSchema();

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

	function extractDateOfBirth(nationalNumber) {
		// Remove dashes or dots if present
		const cleaned = nationalNumber.replace(/[^0-9]/g, '');

		let year = parseInt(cleaned.substring(0, 2), 10);
		const month = cleaned.substring(2, 4);
		const day = cleaned.substring(4, 6);

		// Determine the century
		const currentYear = new Date().getFullYear();
		const currentCentury = Math.floor(currentYear / 100) * 100;
		const fullYearGuess = currentCentury + year;

		// Checksum helps determine if the person was born before 2000
		const base = cleaned.substring(0, 9);
		const checksum = parseInt(cleaned.substring(9, 11), 10);
		let calculatedChecksum = 97 - (parseInt(base, 10) % 97);

		if (calculatedChecksum !== checksum) {
			// If checksum is wrong, try adding 2-digit prefix '2' (for post-2000 births)
			year += 2000;
			calculatedChecksum = 97 - (parseInt('2' + base, 10) % 97);
			if (calculatedChecksum !== checksum) {
				return;
			}
		} else {
			year += 1900;
		}

		return `${year}-${month}-${day}`;
	}

	$effect(() => {
		if (formHandler.form.niss?.length === 11) {
			untrack(() => {
				formHandler.form.date_naissance = extractDateOfBirth(formHandler.form.niss);
			});
		}
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
