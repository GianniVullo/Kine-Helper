<script>
	import { Formulaire } from '$lib/cloud/libraries/formHandler.svelte';
	import { validateurs } from './schemas/PatientSchema';
	import { Form, FormSection, SubmitButton } from './blocks/index';
	import { appState } from '$lib/managers/AppState.svelte';
	import EidReader from '$lib/cloud/libraries/EIDReader.svelte';
	import { onPatientUpsert } from './onSubmits.svelte';
	import { untrack } from 'svelte';
	import { get } from 'svelte/store';
	import { t } from '../../i18n';
	import { object } from 'valibot';
	import { isMobile } from '../../utils/platformwhoami';

	let { patient, mode = 'create' } = $props();

	let formHandler = new Formulaire({
		validateurs,
		schema: object(validateurs),
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
			gsm: patient?.gsm,
			organization_id: appState.selectedOrg.id
		},
		onValid: onPatientUpsert,
		mode
	});

	function extractDateOfBirth(nationalNumber) {
		// Remove dashes or dots if present
		const cleaned = nationalNumber.replace(/[^0-9]/g, '');

		let year = parseInt(cleaned.substring(0, 2), 10);
		const month = cleaned.substring(2, 4);
		const day = cleaned.substring(4, 6);
		const individualNumber = cleaned.substring(6, 9);

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
				console.log('Invalid NISS checksum');
				formHandler.errors.niss = 'Niss invalide';
				return {};
			}
		} else {
			year += 1900;
		}
		const gender = parseInt(individualNumber, 10) % 2 === 0 ? 'F' : 'M';
		return { date: `${year}-${month}-${day}`, gender };
	}

	export const fieldSchema = [
		{
			id: 0,
			titre: 'Identification',
			description: '',
			fields: [
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
					id: 'nom',
					name: 'nom',
					inputType: 'text',
					placeholder: get(t)('shared', 'name'),
					titre: get(t)('shared', 'name'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'prenom',
					name: 'prenom',
					inputType: 'text',
					placeholder: get(t)('shared', 'surname'),
					titre: get(t)('shared', 'surname'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'niss',
					name: 'niss',
					inputType: 'text',
					placeholder: get(t)('form.patient', 'label.niss'),
					titre: get(t)('form.patient', 'label.niss'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'date_naissance',
					name: 'date_naissance',
					inputType: 'date',
					placeholder: get(t)('form.patient', 'label.birthDate'),
					titre: get(t)('form.patient', 'label.birthDate'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-3',
					innerCSS: ''
				},
				{
					id: 'sexe',
					name: 'sexe',
					label: 'Sexe',
					inputType: 'radio',
					titre: get(t)('form.patient', 'label.sex'),
					options: [
						{ id: 'm', value: 'M', name: 'male', label: get(t)('form.patient', 'sex.male') },
						{ id: 'f', value: 'F', name: 'female', label: get(t)('form.patient', 'sex.female') }
					],
					help: null,
					outerCSS: 'col-span-full sm:col-span-full',
					innerCSS: ''
				},
				{
					id: 'adresse',
					name: 'adresse',
					inputType: 'text',
					placeholder: get(t)('shared', 'address'),
					titre: get(t)('shared', 'address'),
					help: null,
					outerCSS: 'col-span-full sm:col-span-full',
					innerCSS: ''
				},
				{
					id: 'cp',
					name: 'cp',
					inputType: 'text',
					placeholder: get(t)('form.postSignup', 'label.postCode'),
					titre: get(t)('form.postSignup', 'label.postCode'),
					help: null,
					outerCSS: 'col-span-2',
					innerCSS: ''
				},
				{
					id: 'localite',
					name: 'localite',
					inputType: 'text',
					placeholder: get(t)('form.postSignup', 'label.city'),
					titre: get(t)('form.postSignup', 'label.city'),
					help: null,
					outerCSS: 'col-span-4',
					innerCSS: ''
				}
			]
		},
		{
			id: 1,
			titre: 'Assurabilité',
			description: '',
			fields: [
				{
					id: 'mutualite',
					name: 'mutualite',
					inputType: 'text',
					placeholder: '319',
					titre: 'Mutualité',
					help: 'Veuillez n\'entrez que des nombres de 3 chiffres. Par exemple "319" pour Solidaris Wallonie',
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				},
				{
					id: 'num_affilie',
					name: 'num_affilie',
					inputType: 'text',
					placeholder: get(t)('form.patient', 'label.num_affilie'),
					titre: get(t)('form.patient', 'label.num_affilie'),
					help: 'Ce champ est <span class="italic ">extrêmement</span> facultatif.',
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				},
				{
					id: 'tiers_payant',
					name: 'tiers_payant',
					inputType: 'checkbox',
					checkboxLabel: get(t)('form.patient', 'label.tiers_payant'),
					checkboxDescription:
						'Cochez cette case pour pratiquer le tiers payant avec ce patient. Vous devrez donc envoyer vos attestations à sa mutuelle.',
					help: null,

					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				},
				{
					id: 'ticket_moderateur',
					name: 'ticket_moderateur',
					inputType: 'checkbox',
					checkboxLabel: get(t)('form.patient', 'label.ticket_moderateur'),
					checkboxDescription:
						'Cochez cette case si vous faites payer le ticket modérateur à votre patient. Attention il y a une limite au nombre de patient pour lequel vous laissez tomber le ticket modérateur.',
					help: null,
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				},
				{
					id: 'bim',
					name: 'bim',
					inputType: 'checkbox',
					checkboxLabel: get(t)('form.patient', 'label.bim'),
					help: null,
					checkboxDescription:
						'Cochez cette case si votre patient est un Bénéficiaire à Intervention Majorée.',
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				}
			]
		},
		{
			id: 2,
			titre: 'Données de contact',
			description: '',
			fields: [
				{
					id: 'tel',
					name: 'tel',
					inputType: 'text',
					placeholder: 'Téléphone 1',
					titre: 'Téléphone 1',
					help: null,
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				},
				{
					id: 'gsm',
					name: 'gsm',
					inputType: 'text',
					placeholder: 'Téléphone 2',
					titre: 'Téléphone 2',
					help: null,
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				},
				{
					id: 'email',
					name: 'email',
					inputType: 'text',
					placeholder: 'email',
					titre: 'Email',
					help: null,
					outerCSS: 'col-span-full sm:col-span-4',
					innerCSS: ''
				}
			]
		}
	];

	$effect(() => {
		if (formHandler.form.niss?.length === 11) {
			console.log('niss', formHandler.form.niss);
			untrack(() => {
				const { date, gender } = extractDateOfBirth(formHandler.form.niss);
				formHandler.form.date_naissance = date;
				formHandler.form.sexe = gender;
			});
		}
	});
</script>

<Form
	title={mode === 'create' ? "Création d'un nouveau patient" : 'Modification du patient'}
	message={formHandler.message}
	isDirty={formHandler.isDirty}>
	{#if mode === 'create' && !isMobile()}
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
