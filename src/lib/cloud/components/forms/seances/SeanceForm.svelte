<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import {
		SeanceSchema,
		checkboxesFields,
		dateField,
		idFieldSchema,
		onValid,
		validateurs,
		defineDuree,
		ComplexSetup,
		seanceTypes
	} from './SeanceSchema.svelte';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import { onMount } from 'svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import Field from '../abstract-components/Field.svelte';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import TarifField from '../tarification-fields/TarifField.svelte';
	import { getTarificationInitialValues } from '../tarification-fields/tarifHelpers';
	import { get } from 'svelte/store';
	import { page } from '$app/state';
	import { t } from '../../../../i18n';
	import SupplementField from '../tarification-fields/SupplementField.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import TarifsListField from '../finances/TarifsListField.svelte';
	import dayjs from 'dayjs';
	import { clock } from '../../../../ui/svgs/IconSnippets.svelte';

	const modalStore = getModalStore();
	let fromCalendarDate = page.url.searchParams.get('date');
	let now = dayjs().format('YYYY-MM-DD');

	let { patient, sp, seance, tarifs, supplements, prescriptions, mode = 'create' } = $props();
	console.log('seance', seance);

	let { groupe_id, lieu_id, patho_lourde_type } = sp;

	const tarifMetadata = getTarificationInitialValues(sp, tarifs, seance);
	const initialValues = {
		user_id: appState.user.id,
		patient_id: patient.patient_id,
		sp_id: sp.sp_id,
		prescription_id:
			(seance?.prescription_id ?? prescriptions.length === 1)
				? prescriptions[0].prescription_id
				: null,
		duree: seance?.duree ?? sp.duree,
		seanceType:
			typeof seance?.seance_type === 'number' ? seanceTypes[seance.seance_type] : undefined,
		lieu_id: seance?.lieu_id ?? sp.lieu_id,
		start: seance?.start,
		duree_custom:
			seance?.metadata?.duree_custom ?? defineDuree(sp.duree, sp.patho_lourde_type, sp.lieu_id),
		seance_id: seance?.seance_id ?? crypto.randomUUID(),
		created_at: seance?.created_at ?? now,
		date: seance?.date ?? fromCalendarDate ?? now,
		ticket_moderateur: seance?.ticket_moderateur ?? patient.ticket_moderateur ?? true,
		indemnite: seance?.indemnite ?? (lieu_id === 3 || groupe_id === 6 ? true : false),
		rapport_ecrit: seance?.rapport_ecrit ?? false,
		intake: seance?.metadata?.intake ?? false,
		supplements_ponctuels:
			seance?.metadata?.supplements_ponctuels?.map((s) => ({
				id: undefined,
				user_id: undefined,
				created_at: undefined,
				nom: s.nom,
				valeur: s.valeur
			})) ?? [],
		groupe_id,
		patho_lourde_type,
		mode,
		...tarifMetadata,
		supplements: seance?.metadata?.supplements ?? []
	};
	console.log('initialValues', initialValues);
	let formHandler = new Formulaire({
		validateurs,
		schema: SeanceSchema,
		isAsynchronous: true,
		submiter: '#seance-submit',
		initialValues,
		onValid,
		mode
	});

	const checkIfRapportEcrit = new Promise(async (resolve, reject) => {
		if (typeof groupe_id === 'number' && [0, 6, 7].includes(groupe_id)) {
			resolve(true);
		}
		let { data, error } = await appState.db.select(
			`SELECT * FROM seances WHERE sp_id = $1 AND rapport_ecrit = 1 AND seance_type != 3`,
			[sp.sp_id]
		);

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
			`SELECT * FROM seances WHERE json_extract(metadata, '$.intake') is not NULL AND seance_type != 3 AND sp_id = $1;`,
			[sp.sp_id]
		);

		if (error) {
			reject(error);
		}
		if (data.length > 0 && !seance?.metadata?.intake) {
			resolve(true);
		} else {
			resolve(false);
		}
	});

	const modal = (element, elementType) => ({
		type: 'confirm',
		title: 'Confirmation',
		body: `Voulez-vous vraiment supprimer ${element.nom} ?`,
		buttonTextConfirm: get(t)('shared', 'confirm'),
		buttonTextCancel: get(t)('shared', 'cancel'),
		modalClasses: {
			buttonPositive: 'isModal'
		},
		response: async (r) => {
			if (r) {
				formHandler.form[elementType] = formHandler.form[elementType].filter(
					(s) => s.id != element.id
				);
			}
		}
	});

	const duree_custom_help = $derived.by(() => {
		if (sp.groupe_id === 4 && formHandler.form.seanceType === 'seconde') {
			return 'Deux durées possibles dans la nomenclature : 15 ou 30 minutes. Pour toutes durées supérieures à 20 minutes Kiné Helper assignera le code de nomenclature de 30 minutes.';
		}
		return '';
	});

	const manager = new ComplexSetup(
		formHandler.mode === 'create' ? false : true,
		seance,
		formHandler,
		sp
	);

	onMount(() => {
		formHandler.setup();
	});
</script>

<Form
	title={formHandler.mode === 'create' ? 'Créer une Séance' : 'Modifier la séance'}
	message={formHandler.message}>
	<FormSection titre="Informations générales">
		<!--* Id fields -->
		{#each idFieldSchema as idField}
			<Field
				field={idField}
				error={formHandler.errors?.[idField.name]}
				bind:value={formHandler.form[idField.name]} />
		{/each}

		<!--* prescription -->
		<div class="col-span-full md:col-span-3">
			<SimpleSelect
				label="Prescription"
				bind:value={formHandler.form.prescription_id}
				options={prescriptions.map((p) => ({
					label: p.date + ' - ' + p.prescripteur.nom,
					value: p.prescription_id
				}))} />
		</div>

		<!--* Le type de séance -->
		<Field
			field={{
				options: manager.seanceTypes,
				inputType: 'select',
				outerCSS: 'col-span-full md:col-span-3',
				label: 'Type de séance'
			}}
			bind:value={formHandler.form.seanceType}
			error={formHandler.errors.seanceType} />

		<!--* Date Field with conditions -->
		<Field
			field={dateField}
			bind:value={formHandler.form.date}
			error={formHandler.errors.date}
			warning={manager.dateWarning} />

		<!--* Start -->
		<Field
			field={{
				inputType: 'time',
				titre: 'Heure du rendez-vous',
				outerCSS: 'col-span-full sm:col-span-2'
			}}
			bind:value={formHandler.form.start}
			error={formHandler.errors.start} />

		{#snippet minute()}
			<p class="text-gray-500">min</p>
		{/snippet}
		<!--* duree_custom -->
		<Field
			field={{
				inputType: 'number',
				leading: clock,
				removeArrows: true,
				leadingCSS: 'size-6 stroke-black',
				trailing: minute,
				help: duree_custom_help,
				titre: 'Durée de la séance',
				outerCSS: 'col-span-full sm:col-span-2'
			}}
			bind:value={formHandler.form.duree_custom}
			error={formHandler.errors.duree_custom} />
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
		<Field
			field={checkboxesFields[3]}
			error={formHandler.errors?.[checkboxesFields[3].name]}
			bind:value={formHandler.form[checkboxesFields[3].name]} />
		{#if !patient.bim}
			{#if !appState.user.conventionne}
				<TarifField
					bind:form={formHandler.form}
					errors={formHandler.errors}
					{tarifs}
					seance={formHandler.form.seanceType === 'kiné'}
					consultatif={formHandler.form.seanceType === 'consult'}
					seconde_seance={formHandler.form.seanceType === 'seconde'}
					indemnite={formHandler.form.indemnite && formHandler.form.seanceType !== 'no-show'}
					rapport={formHandler.form.rapport_ecrit && formHandler.form.seanceType !== 'no-show'}
					intake={formHandler.form.intake && formHandler.form.seanceType !== 'no-show'}
					no_show={formHandler.form.seanceType === 'no-show'} />
			{/if}
			<SupplementField
				bind:value={formHandler.form.supplements}
				errors={formHandler.errors?.supplements}
				{supplements} />
			<TarifsListField
				label="Suppléments ponctuels"
				key="supplements_ponctuels"
				bind:tarifList={formHandler.form.supplements_ponctuels}
				addButtonLabel="Ajouter un supplément ponctuel"
				removeButtonLabel="Supprimer"
				addButtonHandler={async (e) => {
					e.preventDefault();
					formHandler.form.supplements_ponctuels = [
						...formHandler.form.supplements_ponctuels,
						{
							id: crypto.randomUUID(),
							nom: null,
							valeur: null,
							created_at: now,
							user_id: appState.user.id
						}
					];
				}}
				removeButtonHandler={(custom_tarif) => (e) => {
					e.preventDefault();
					modalStore.trigger(modal(custom_tarif, 'supplements_ponctuels'));
				}} />
		{/if}
	</FormSection>
	<SubmitButton id="seance-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
