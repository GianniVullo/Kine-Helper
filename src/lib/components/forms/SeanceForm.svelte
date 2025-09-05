<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { Form, FormSection, Field, SubmitButton } from './blocks';
	import { appState } from '$lib/managers/AppState.svelte';
	import { page } from '$app/state';
	import { SupplementField, TarifsListField, TarifField, SimpleSelect } from './fields/index';
	import dayjs from 'dayjs';
	import { clock } from '$lib/ui/svgs/IconSnippets.svelte';
	import { pushState } from '$app/navigation';
	import Modal from '$lib/cloud/libraries/overlays/Modal.svelte';
	import { initialSeanceValues, SeanceSchema, validateurs } from './schemas/SeanceSchema.svelte';
	import { onSeanceUpsert } from './onSubmits.svelte';
	import {
		idFieldSchema,
		paymentFields,
		dateField,
		checkboxesFields,
		SingleSeanceSetup
	} from './utils/SeanceReactiveSetup.svelte';

	let now = dayjs().format('YYYY-MM-DD');

	let { patient, sp, seance, tarifs, supplements, prescriptions, mode = 'create' } = $props();

	let { groupe_id } = sp;

	let formHandler = new Formulaire({
		validateurs,
		schema: SeanceSchema,
		isAsynchronous: true,
		submiter: '#seance-submit',
		initialValues: initialSeanceValues({ patient, sp, seance, prescriptions, tarifs, mode }),
		onValid: onSeanceUpsert,
		mode
	});

	const manager = new SingleSeanceSetup(seance, formHandler, sp);
	const duree_custom_help = $derived.by(() => {
		if (sp.groupe_id === 4 && formHandler.form.seanceType === 'seconde') {
			return manager.duree_custom_help;
		}
		return '';
	});
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
		{#await manager.checkIfRapportEcrit then value}
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
		{#await manager.checkIfIntake then value}
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
