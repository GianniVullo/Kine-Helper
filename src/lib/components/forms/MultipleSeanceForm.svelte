<script>
	import { Formulaire } from '../../cloud/libraries/formHandler.svelte';
	import { Form, FormSection, Field, SubmitButton } from './blocks/index';
	import { TarifField, SupplementField, TarifsListField } from './fields/index';
	import {
		idFieldSchema,
		checkboxesFields,
		paymentFields,
		MultipleSeanceSetup
	} from './utils/SeanceReactiveSetup.svelte';
	import {
		MultipleSeancesSchema,
		seance_prototype_validateur,
		validateurs,
		initialSeanceValues
	} from './schemas/SeanceSchema.svelte';
	import { onMultipleSeanceUpsert } from './onSubmits.svelte';
	import { appState } from '$lib/managers/AppState.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import dayjs from 'dayjs';
	import { clock } from '$lib/ui/svgs/IconSnippets.svelte';
	import { pushState } from '$app/navigation';
	import Modal from '../../cloud/libraries/overlays/Modal.svelte';
	import EventCalendar from '$lib/EventCalendar.svelte';
	import { eventFormater } from '$lib/utils/calendarEventFormater';
	import Stepper from '../../cloud/components/ui/Stepper.svelte';
	import { array, object, safeParse } from 'valibot';

	let ec;
	let now = dayjs().format('YYYY-MM-DD');

	let { patient, sp, seance, tarifs, supplements, prescriptions, mode = 'create' } = $props();

	let { groupe_id } = sp;

	let initialValues = {
		seances: [],
		seance_prototype: initialSeanceValues({ patient, sp, seance, prescriptions, tarifs, mode })
	};

	let formHandler = new Formulaire({
		validateurs: {
			seances: array(object(validateurs)),
			seance_prototype: object(seance_prototype_validateur)
		},
		schema: MultipleSeancesSchema,
		isAsynchronous: true,
		submiter: '#seance-submit',
		initialValues,
		onValid: onMultipleSeanceUpsert,
		mode
	});

	const manager = new MultipleSeanceSetup(formHandler, sp);

	const duree_custom_help = $derived.by(() => {
		if (sp.groupe_id === 4 && formHandler.form.seance_prototype.seanceType === 'seconde') {
			return manager.duree_custom_help;
		}
		return '';
	});

	let currentStep = $state(0);
	onMount(() => {
		manager.ec = ec;
	});

	function dateComparator(s, event) {
		let first = `${dayjs(s.date).format('YYYY-MM-DD')}T${s.start}:00`;
		let second = event.dateStr;
		return first === second;
	}
	let alreadyThereEvents = sp.seances.map((s) =>
		eventFormater(s, patient, {
			editable: false,
			startEditable: false,
			durationEditable: false,
			extendedProps: { wasThere: true },
			backgroundColor: '#bdbdbd', // neutral gray: unselectable but informative
			textColor: '#333333'
		})
	);
	// Pop the seance_id field
	idFieldSchema.pop();
</script>

{#snippet step1()}
	<FormSection
		titre="Étape 2/2 : Sélectionner des dates"
		description="Cliquez sur le calendrier pour définir des dates à vos séances. Chaque nouvelles séance se verra attribuer des valeurs par défaut. Vous pourrez les modifier dans le formulaire ci-dessous. Cliquez sur une séance pour la modifier.">
		<div class="col-span-full w-full">
			<EventCalendar
				bind:ec
				events={alreadyThereEvents}
				options={{
					eventClick(infos) {
						// on event clicked we remove it if it is not already in the sp
						console.log('event clicked', infos);
						if (infos.event.extendedProps.wasThere) {
							console.log('was there');
							return;
						}
						let events = ec.getEvents();
						const event = events.find((seance) =>
							dateComparator(
								{ ...seance.extendedProps.seance, start: dayjs(seance.start).format('HH:mm') },
								{
									dateStr: dayjs(infos.event.start).format('YYYY-MM-DDTHH:mm:ss')
								}
							)
						);
						console.log('event', event);
						if (event) {
							console.log('removing');
							ec.removeEventById(event.id);
							formHandler.form.seances = formHandler.form.seances.filter(
								(s) => s.seance_id !== event.id
							);
						}
						// manager.selectedSeance = formHandler.form.seances.findIndex(
						// 	(seance) => seance.seance_id === infos.event.id
						// );
					},
					dateClick: (event) => {
						console.log('date clicked', event);
						const clickedDate = dayjs(event.date);
						if (
							formHandler.form.seances.some((s) => {
								return dateComparator(s, event);
							})
						) {
							return;
						}
						let newSeance = {
							seance_id: crypto.randomUUID(),
							date: clickedDate.format('YYYY-MM-DD'),
							seanceType: 'kiné',
							start: clickedDate.format('HH:mm')
						};
						console.log('newSeance', newSeance);

						manager.selectedSeance = formHandler.form.seances.length;

						formHandler.form.seances.push(newSeance);
						let eventFormatedSeance = eventFormater(
							{
								...formHandler.form.seance_prototype,
								...newSeance,
								start: dayjs(event.dateStr).format('HH:mm')
							},
							patient
						);
						console.log('eventFormatedSeance', eventFormatedSeance);
						ec.addEvent(eventFormatedSeance);
						// ec.unselect();
					},
					eventDragStart: (event) => {
						console.log('event drag start', event);
					},
					eventDragStop(event) {
						console.log('event drag stop', event);
					},
					datesSet(info) {
						console.log('dates set', info);
					},
					eventDrop(info) {
						console.log('drop', info);
					},
					// select(info) {
					// 	console.log('select', info);
					// },
					// unselect(info) {
					// 	console.log('unselect', info);
					// },
					view: 'timeGridWeek',
					height: '600px',
					slotDuration: '00:30:00',
					scrollTime: '08:00:00',
					slotLabelInterval: '01:00:00',
					dragScroll: false
				}} />
		</div>
	</FormSection>
{/snippet}

{#snippet step0()}
	<FormSection
		titre="Étape 1/2 : Prototype des séances"
		description="Définissez les valeurs par défaut des séances.">
		{#each idFieldSchema as idField}
			<Field
				field={idField}
				error={formHandler.errors?.seance_prototype?.[idField.name]}
				bind:value={formHandler.form.seance_prototype[idField.name]} />
		{/each}
		<!--* prescription -->
		<Field
			field={{
				options: prescriptions.map((p) => ({
					label: p.date + ' - ' + p.prescripteur.nom,
					value: p.prescription_id
				})),
				inputType: 'select',
				outerCSS: 'col-span-full md:col-span-3',
				label: 'Prescription'
			}}
			bind:value={formHandler.form.seance_prototype.prescription_id}
			error={formHandler.errors.prescription_id} />

		<!--* Le type de séance -->
		<Field
			field={{
				options: manager.seanceTypes,
				inputType: 'select',
				outerCSS: 'col-span-full md:col-span-3',
				label: 'Type de séance'
			}}
			bind:value={formHandler.form.seance_prototype.seanceType}
			error={formHandler.errors.seanceType} />

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
			bind:value={formHandler.form.seance_prototype.duree_custom}
			error={formHandler.errors.duree_custom} />
	</FormSection>
	<FormSection titre="Information relative à la tarification">
		<div class="col-span-full">
			<Field
				field={paymentFields[0]}
				error={formHandler.errors?.[paymentFields[0].name]}
				bind:value={formHandler.form.seance_prototype[paymentFields[0].name]} />
		</div>

		{#if formHandler.form.seance_prototype.is_paid}
			<div class="col-span-full">
				<Field
					field={paymentFields[1]}
					error={formHandler.errors?.[paymentFields[1].name]}
					bind:value={formHandler.form.seance_prototype[paymentFields[1].name]} />
			</div>
		{/if}

		<!--* Indemnité -->
		{#if sp.lieu_id === 3 || seance?.lieu_id === 3}
			<div class="col-span-full">
				<Field
					field={checkboxesFields[0]}
					error={formHandler.errors?.[checkboxesFields[0].name]}
					bind:value={formHandler.form.seance_prototype[checkboxesFields[0].name]} />
			</div>
		{/if}
		<!--* Rapport écrit -->
		{#await manager.checkIfRapportEcrit then value}
			<!-- promise was fulfilled -->
			{#if ((typeof groupe_id === 'number' && ![0, 6, 7].includes(groupe_id)) || !groupe_id) && !value}
				<div class="col-span-full">
					<Field
						field={{
							...checkboxesFields[1],
							help: 'Cocher cette case attribuera le code de Rapport Écrit à la première séance de la série.'
						}}
						error={formHandler.errors?.[checkboxesFields[1].name]}
						bind:value={formHandler.form.seance_prototype[checkboxesFields[1].name]} />
				</div>
			{/if}
		{:catch error}
			{error}
		{/await}
		<!--* Intake -->
		{#await manager.checkIfIntake then value}
			{#if ((typeof groupe_id === 'number' && groupe_id === 0) || !groupe_id) && !value}
				<Field
					field={{
						...checkboxesFields[2],
						help: "Cocher cette case attribuera le code d'Intake à la première séance de la série."
					}}
					error={formHandler.errors?.[checkboxesFields[2].name]}
					bind:value={formHandler.form.seance_prototype[checkboxesFields[2].name]} />
			{/if}
		{:catch error}
			{error}
		{/await}
		<Field
			field={checkboxesFields[3]}
			error={formHandler.errors?.[checkboxesFields[3].name]}
			bind:value={formHandler.form.seance_prototype[checkboxesFields[3].name]} />
		{#if !patient.bim}
			{#if !appState.user.conventionne}
				<TarifField
					bind:form={formHandler.form.seance_prototype}
					errors={formHandler.errors}
					{tarifs}
					seance={formHandler.form.seance_prototype.seanceType === 'kiné'}
					consultatif={formHandler.form.seance_prototype.seanceType === 'consult'}
					seconde_seance={formHandler.form.seance_prototype.seanceType === 'seconde'}
					indemnite={formHandler.form.seance_prototype.indemnite &&
						formHandler.form.seance_prototype.seanceType !== 'no-show'}
					rapport={formHandler.form.seance_prototype.rapport_ecrit &&
						formHandler.form.seance_prototype.seanceType !== 'no-show'}
					intake={formHandler.form.seance_prototype.intake &&
						formHandler.form.seance_prototype.seanceType !== 'no-show'}
					no_show={formHandler.form.seance_prototype.seanceType === 'no-show'} />
			{/if}
			<SupplementField
				bind:value={formHandler.form.seance_prototype.supplements}
				errors={formHandler.errors?.supplements}
				{supplements} />
			<TarifsListField
				label="Suppléments ponctuels"
				key="supplements_ponctuels"
				bind:tarifList={formHandler.form.seance_prototype.supplements_ponctuels}
				addButtonLabel="Ajouter un supplément ponctuel"
				removeButtonLabel="Supprimer"
				addButtonHandler={async (e) => {
					e.preventDefault();
					formHandler.form.seance_prototype.supplements_ponctuels = [
						...formHandler.form.seance_prototype.supplements_ponctuels,
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
{/snippet}

<Form title="Création de multiple séances" message={formHandler.message}>
	<Stepper
		steps={[step0, step1]}
		bind:currentStep
		validations={[
			() => {
				console.log('Validating step 0', seance_prototype_validateur);
				let valid = safeParse(object(seance_prototype_validateur), formHandler.form.seance_prototype);
				console.log('Seance prototype valid:', valid);
				if (
					!valid.success &&
					valid.issues.some((issue) => issue.path?.[0]?.key === 'prescription_id')
				) {
					formHandler.extractErrorForSchema(valid);
					const message = valid.issues.find(
						(issue) => issue.path?.[0]?.key === 'prescription_id'
					)?.message;
					console.warn('Prescription ID error:', message);
					formHandler.errors.prescription_id = message;
				}
				// formHandler.errors.prescription_id
				return valid.success;
			}
		]} />
	<div class:invisible={currentStep === 0}>
		<SubmitButton loading={formHandler.loading} id="seance-submit" className="col-span-full" />
	</div>
</Form>
<Modal
	opened={page?.state?.modal?.display}
	title={'Supprimer de ' + page?.state?.modal?.key}
	body={`Êtes-vous sûr de vouloir supprimer ${page?.state?.modal?.nom ? '"' + page.state.modal.nom + '"' : 'cet élément'} ?`}
	buttonTextConfirm="Supprimer"
	buttonTextCancel="Annuler"
	onAccepted={async () => {
		formHandler.form.seance_prototype[page?.state?.modal?.key] = formHandler.form.seance_prototype[
			page?.state?.modal?.key
		].filter((tarif) => tarif.id !== page?.state?.modal?.id);
		history.back();
	}} />
<!-- {JSON.stringify(formHandler.form.seance_prototype)} -->
