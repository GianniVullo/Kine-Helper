<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import {
		SeanceSchema,
		checkboxesFields,
		dateField,
		idFieldSchema,
		onValid,
		validateurs
	} from './SeanceSchema';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { isoDate, safeParse } from 'valibot';
	import Field from '../abstract-components/Field.svelte';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import TarifField from '../tarification-fields/TarifField.svelte';

	let { patient, sp, seance, mode = 'create' } = $props();

	let { groupe_id, lieu_id, patho_lourde_type, metadata } = sp;

	let formHandler = new Formulaire({
		validateurs,
		schema: SeanceSchema,
		submiter: '#seance-submit',
		initialValues: seance ?? {
			user_id: appState.user.id,
			patient_id: patient.patient_id,
			sp_id: sp.sp_id,
			seance_id: crypto.randomUUID(),
			tiers_payant: false,
			ticket_moderateur: true,
			bim: false,
			indemnite: lieu_id === 3 || groupe_id === 6 ? true : false,
			groupe_id,
			patho_lourde_type
		},
		onValid,
		mode
	});

	let seanceTheSameDayChecker = $derived(
		new Promise(async (resolve) => {
			resolve(await checkSeance(formHandler.form.date));
		})
	);

	async function checkSeance(date) {
		let valid = safeParse(isoDate(), date);
		if (valid.success) {
			appState.db.select('SELECT count(*) FROM seances WHERE date(date) = $1 AND sp_id = $2', [
				date,
				sp.sp_id
			]);
		}
	}

	const checkIfRapportEcrit = new Promise(async (resolve, reject) => {
		console.log('in checkIfRapportEcrit with ', typeof groupe_id, groupe_id);

		if (typeof groupe_id === 'number' && [0, 6, 7].includes(groupe_id)) {
			resolve(true);
		}
		let { data, error } = await appState.db.select(
			`SELECT * FROM seances WHERE sp_id = $1 AND json_extract(metadata, '$.rapport_ecrit') is not NULL`,
			[sp.sp_id]
		);
		console.log('data in checkIfRapportEcrit', data);

		if (error) {
			reject(error);
		}
		if (data.length > 0) {
			resolve(true);
		} else {
			resolve(false);
		}
	});

	const checkIfIntake = new Promise(async (resolve, reject) => {
		if (groupe_id && groupe_id !== 0) {
			resolve(true);
		}
		let { data, error } = await appState.db.select(
			`SELECT * FROM seances WHERE json_extract(metadata, '$.intake') is not NULL AND sp_id = $1;`,
			[sp.sp_id]
		);
		console.log(data);
		
		if (error) {
			reject(error);
		}
		if (data.length > 0) {
			resolve(true);
		} else {
			resolve(false);
		}
	});

	const sTypes = [
		{ label: 'Séance de kinésitherapie', id: 'kiné', value: 'kiné' },
		{ label: 'Séance à titre consultative', id: 'consult', value: 'consult' },
		{ label: 'Seconde séance dans la journée', id: 'seconde', value: 'seconde' }
	];
	let seanceTypes = $state([sTypes]);
	$effect(() => {
		appState.db
			.select('SELECT * FROM seances WHERE date(date) = $1 AND sp_id = $2', [
				formHandler.form.date,
				sp.sp_id
			])
			.then(({ data, error }) => {
				if (error) {
					formHandler.message = 'Erreur, la table séance ne peut pas être sélectionnée' + error;
				}
				if (data.length === 0) {
					if (formHandler.form.seanceType === 'seconde') {
						formHandler.form.seanceType = 'kiné';
					}
					formHandler.message = null;
					formHandler.errors.date = null;
					seanceTypes = sTypes.filter((st) => st.value !== 'seconde');
					console.log(sTypes);
				}
				if (data.length === 1) {
					formHandler.message =
						'Attention, il y a déjà une séance ce jour là. Si cela est permis vous pouvez tarifez une seconde séance. Pour le volet j) d\'une pathologie lourde veuillez sélectionner "séance de kinésitherapie"';
					if (
						typeof groupe_id === 'number' &&
						groupe_id === 1 &&
						typeof patho_lourde_type === 'number' &&
						patho_lourde_type === 5
					) {
						formHandler.form.seanceType = 'kiné';
						seanceTypes = sTypes.filter((st) => {
							st.value === 'kiné';
						});
					} else {
						console.log('in else', sTypes);

						formHandler.form.seanceType = 'seconde';
						seanceTypes = sTypes.filter((st) => st.value === 'seconde');
						console.log(seanceTypes);
					}
				}
				if (data.length > 1) {
					if (
						typeof groupe_id === 'number' &&
						groupe_id !== 1 &&
						typeof patho_lourde_type === 'number' &&
						patho_lourde_type !== 5
					) {
						formHandler.errors.date = 'Attention, il y a déjà deux séances ce jour là !';
					} else {
						formHandler.message =
							"Attention, il y a déjà deux séances ce jour là, votre attestation risque d'être invalide si vous ne soignez pas une pathologie lourde volet j). Vous n'avez pas spécifié ces données dans le formulaire situation pathologique. Kiné Helper n'est donc pas en mesure de valider ce champ. Si vous êtes sûr de vous, Kiné Helper ne vous bloquera pas.";
					}
				}
			});
	});
	onMount(() => {
		formHandler.setup();
	});
</script>

<Form title="Créer une Séance" message={formHandler.message}>
	<FormSection titre="Informations générales">
		<!--* Id fields -->
		{#each idFieldSchema as idField}
			<Field
				field={idField}
				error={formHandler.errors?.[idField.name]}
				bind:value={formHandler.form[idField.name]} />
		{/each}

		<!--* Date Field with conditions -->
		<Field field={dateField} bind:value={formHandler.form.date} />

		<!--* Le type de séance -->
		<Field
			field={{
				options: seanceTypes,
				inputType: 'select',
				outerCSS: 'col-span-full sm:col-span-4',
				label: 'Type de séance'
			}}
			bind:value={formHandler.form.seanceType} />
	</FormSection>
	<FormSection titre="Information relative à la tarification">
		<!--* Indemnité -->
		<Field
			field={checkboxesFields[0]}
			error={formHandler.errors?.[checkboxesFields[0].name]}
			bind:value={formHandler.form[checkboxesFields[0].name]} />
		<!--* Rapport écrit -->
		{#await checkIfRapportEcrit then value}
			<!-- promise was fulfilled -->
			{#if ((typeof groupe_id === 'number' && ![0, 6, 7].includes(groupe_id)) || !groupe_id) && !value}
				<Field
					field={checkboxesFields[1]}
					error={formHandler.errors?.[checkboxesFields[1].name]}
					bind:value={formHandler.form[checkboxesFields[1].name]} />
			{/if}
		{:catch error}
			{error}
		{/await}
		<!--* Intake -->
		{#await checkIfIntake then value}
			{#if ((typeof groupe_id === 'number' && groupe_id === 0) || !groupe_id) && !value}
				<Field
					field={checkboxesFields[2]}
					error={formHandler.errors?.[checkboxesFields[2].name]}
					bind:value={formHandler.form[checkboxesFields[2].name]} />
			{/if}
		{:catch error}
			{error}
		{/await}
		<TarifField bind:form={formHandler.form} errors={formHandler.errors} />
	</FormSection>
	<SubmitButton id="seance-submit" className="col-span-full" />
</Form>

{JSON.stringify(formHandler.form)}
