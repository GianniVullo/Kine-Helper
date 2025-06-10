<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import {
		checkboxesFields,
		dateField,
		idFieldSchema,
		onValid,
		ComplexSetup,
		buildSeanceSchema,
		paymentFields
	} from './SeanceSchema.svelte';
	import Form from '../abstract-components/Form.svelte';
	import FormSection from '../abstract-components/FormSection.svelte';
	import SubmitButton from '../../../../forms/ui/SubmitButton.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import Field from '../abstract-components/Field.svelte';
	import SimpleSelect from '../fields/SimpleSelect.svelte';
	import TarifField from '../tarification-fields/TarifField.svelte';
	import { page } from '$app/state';
	import SupplementField from '../tarification-fields/SupplementField.svelte';
	import TarifsListField from '../finances/TarifsListField.svelte';
	import dayjs from 'dayjs';
	import { clock } from '../../../../ui/svgs/IconSnippets.svelte';
	import { pushState } from '$app/navigation';
	import Modal from '../../../libraries/overlays/Modal.svelte';
	import { initialSeanceValues } from './Commons.svelte';

	let now = dayjs().format('YYYY-MM-DD');

	let { patient, sp, seance, tarifs, supplements, prescriptions, mode = 'create' } = $props();

	let { groupe_id } = sp;

	let { SeanceSchema, validateurs } = buildSeanceSchema();

	let formHandler = new Formulaire({
		validateurs,
		schema: SeanceSchema,
		isAsynchronous: true,
		submiter: '#seance-submit',
		initialValues: initialSeanceValues({ patient, sp, seance, prescriptions, tarifs, mode }),
		onValid,
		mode
	});

	const checkIfRapportEcrit = new Promise(async (resolve, reject) => {
		console.log('In check rapport ecrit');

		// Here the groups that doesn't allow a rapport ecrit to be created
		if (typeof groupe_id === 'number' && [0, 6, 7].includes(groupe_id)) {
			console.log('In check rapport ecrit : returning true');
			resolve(true);
		}
		let { data, error } = await appState.db.select(
			`SELECT * FROM seances WHERE sp_id = $1 AND rapport_ecrit = $2`,
			[sp.sp_id, true]
		);
		console.log('In check rapport ecrit : fetched seance', data);

		// We filter out the seances that are no-shows
		data = data.filter((s) => s.seance_type !== 3);

		// We filter out the seances that are not in the same year
		data = data.filter((s) => {
			const seanceDate = dayjs(s.date);
			const currentDate = dayjs();
			return seanceDate.year() === currentDate.year();
		});

		console.log('In check rapport ecrit : filtered seance', data);
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
</script>

<Modal
	opened={page?.state?.modal?.display}
	title={'Supprimer de ' + page?.state?.modal?.key}
	body={`Êtes-vous sûr de vouloir supprimer ${page?.state?.modal?.nom ? '"' + page.state.modal.nom + '"' : 'cet élément'} ?`}
	buttonTextConfirm="Supprimer"
	buttonTextCancel="Annuler"
	onAccepted={async () => {
		formHandler.form[page?.state?.modal?.key] = formHandler.form[page?.state?.modal?.key].filter(
			(tarif) => tarif.id !== page?.state?.modal?.id
		);
		history.back();
	}} />

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
		<Field
			field={paymentFields[0]}
			error={formHandler.errors?.[paymentFields[0].name]}
			bind:value={formHandler.form[paymentFields[0].name]} />

		{#if formHandler.form.is_paid}
			<Field
				field={paymentFields[1]}
				error={formHandler.errors?.[paymentFields[1].name]}
				bind:value={formHandler.form[paymentFields[1].name]} />
		{/if}

		<!--* Indemnité -->
		{#if sp.lieu_id === 3 || seance?.lieu_id === 3}
			<Field
				field={checkboxesFields[0]}
				error={formHandler.errors?.[checkboxesFields[0].name]}
				bind:value={formHandler.form[checkboxesFields[0].name]} />
		{/if}
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
					pushState('', {
						...page.state,
						modal: { key: 'supplements_ponctuels', display: true, ...custom_tarif }
					});
				}} />
		{/if}
	</FormSection>
	<SubmitButton loading={formHandler.loading} id="seance-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form)} -->
