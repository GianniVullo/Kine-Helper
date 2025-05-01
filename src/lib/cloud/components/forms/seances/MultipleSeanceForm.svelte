<script>
	import { Formulaire } from '../../../libraries/formHandler.svelte';
	import {
		MultipleSeancesSchema,
		checkboxesFields,
		dateField,
		idFieldSchema,
		onValid,
		validateurs,
		defineDuree,
		ComplexSetup,
		seanceTypes
	} from './MultipleSeanceSchema.svelte';
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
	import TarifsListField from '../finances/TarifsListField.svelte';
	import dayjs from 'dayjs';
	import { clock } from '../../../../ui/svgs/IconSnippets.svelte';
	import { pushState } from '$app/navigation';
	import Modal from '../../../libraries/overlays/Modal.svelte';
	import EventCalendar from '../../../../EventCalendar.svelte';
	import { array, object } from 'valibot';
	import { eventFormater } from '../../../../utils/calendarEventFormater';
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';

	let ec;
	let now = dayjs().format('YYYY-MM-DD');

	let { patient, sp, seance, tarifs, supplements, prescriptions, mode = 'create' } = $props();

	let { groupe_id, lieu_id, patho_lourde_type } = sp;

	const tarifMetadata = getTarificationInitialValues(sp, tarifs, seance);

	const initialValues = () => ({
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
		lieu_id: seance?.lieu_id ?? sp?.lieu_id,
		duree_custom:
			seance?.metadata?.duree_custom ?? defineDuree(sp.duree, sp.patho_lourde_type, sp.lieu_id),
		seance_id: seance?.seance_id ?? crypto.randomUUID(),
		created_at: seance?.created_at ?? now,
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
	});

	let formHandler = new Formulaire({
		validateurs: { seances: array(object(validateurs)) },
		schema: MultipleSeancesSchema,
		isAsynchronous: true,
		submiter: '#seance-submit',
		initialValues: { seances: [] },
		onValid,
		mode
	});

	const manager = new ComplexSetup(formHandler, sp, patient);

	const checkIfRapportEcrit = new Promise(async (resolve, reject) => {
		if (typeof groupe_id === 'number' && [0, 6, 7].includes(groupe_id)) {
			resolve(true);
		}
		let { data, error } = await appState.db.select(
			`SELECT * FROM seances WHERE sp_id = $1 AND rapport_ecrit = TRUE AND seance_type != 3`,
			[sp.sp_id]
		);

		if (error) {
			reject(error);
		}
		data.push(...formHandler.form.seances.filter((s) => s.rapport_ecrit));
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
		data.push(...formHandler.form.seances.filter((s) => s.metadata?.intake));
		if (data.length > 0 && !seance?.metadata?.intake) {
			resolve(true);
		} else {
			resolve(false);
		}
	});

	const duree_custom_help = $derived.by(() => {
		if (
			sp.groupe_id === 4 &&
			formHandler.form.seances[manager.selectedSeance].seanceType === 'seconde'
		) {
			return 'Deux durées possibles dans la nomenclature : 15 ou 30 minutes. Pour toutes durées supérieures à 20 minutes Kiné Helper assignera le code de nomenclature de 30 minutes.';
		}
		return '';
	});

	// ComplexSetup est là pour s'assurer qu l'utilisateur ne puisse pas créer de séances avec des erreurs
	// par exemple redéfinir constamment le champs seanceType pour que le patient ne puisse pas créer de secondes séances pour une pathologie courante

	onMount(() => {
		formHandler.setup();
		manager.ec = ec;
	});
</script>

<Modal
	opened={page?.state?.modal?.display}
	title={'Supprimer de ' + page?.state?.modal?.key}
	body={`Êtes-vous sûr de vouloir supprimer ${page?.state?.modal?.nom ? '"' + page.state.modal.nom + '"' : 'cet élément'} ?`}
	buttonTextConfirm="Supprimer"
	buttonTextCancel="Annuler"
	onAccepted={async () => {
		formHandler.form.seances[manager.selectedSeance][page?.state?.modal?.key] =
			formHandler.form.seances[manager.selectedSeance][page?.state?.modal?.key].filter(
				(tarif) => tarif.id !== page?.state?.modal?.id
			);
		history.back();
	}} />

<Form title="Création de multiple séances" message={formHandler.message}>
	<FormSection
		titre="Sélectionner des dates"
		description="Cliquez sur le calendrier pour définir des dates à vos séances. Chaque nouvelles séance se verra attribuer des valeurs par défaut. Vous pourrez les modifier dans le formulaire ci-dessous. Cliquez sur une séance pour la modifier.">
		<div class="col-span-full w-full">
			<EventCalendar
				bind:ec
				events={[]}
				options={{
					eventClick(infos) {
						console.log('event clicked', infos);
						manager.selectedSeance = formHandler.form.seances.findIndex(
							(seance) => seance.seance_id === infos.event.id
						);
					},
					dateClick: (event) => {
						console.log('date clicked', event);
						const clickedDate = dayjs(event.date);
						if (
							formHandler.form.seances.some((s) => {
								let first = `${dayjs(s.date).format('YYYY-MM-DD')}T${s.start}:00`;
								let second = event.dateStr;
								console.log('first', first);
								console.log('second', second);
								return first === second;
							})
						) {
							return;
						}
						let newSeance = {
							...initialValues(),
							date: clickedDate.format('YYYY-MM-DD'),
							seanceType: 'kiné',
							start: clickedDate.format('HH:mm')
						};
						console.log('newSeance', newSeance);

						manager.selectedSeance = formHandler.form.seances.length;

						formHandler.form.seances.push(newSeance);
						ec.addEvent(eventFormater(newSeance, patient));
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
					select(info) {
						console.log('select', info);
					},
					unselect(info) {
						console.log('unselect', info);
					},
					view: 'timeGridWeek',
					height: '600px',
					slotDuration: '00:30:00',
					scrollTime: '08:00:00',
					slotLabelInterval: '01:00:00',
					dragScroll: false
				}} />
		</div>
	</FormSection>
	{#if typeof manager.selectedSeance == 'number'}
		<FormSection titre="Séance sélectionnée">
			<!--* Id fields -->
			{#each idFieldSchema as idField}
				<Field
					field={idField}
					error={formHandler.errors?.[idField.name]}
					bind:value={formHandler.form.seances[manager.selectedSeance][idField.name]} />
			{/each}

			<div class="col-span-full">
				<BoutonPrincipal
					color="error"
					size="sm"
					onclick={(e) => {
						e.preventDefault();
						ec.removeEventById(formHandler.form.seances[manager.selectedSeance].seance_id);
						formHandler.form.seances.splice(manager.selectedSeance, 1);
						manager.selectedSeance = undefined;
					}}
					inner="Supprimer la séance" />
			</div>
			<!--* prescription -->
			<div class="col-span-full md:col-span-3">
				<SimpleSelect
					label="Prescription"
					bind:value={formHandler.form.seances[manager.selectedSeance].prescription_id}
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
				bind:value={formHandler.form.seances[manager.selectedSeance].seanceType}
				error={formHandler.errors.seanceType} />

			<!--* Date Field with conditions -->
			<Field
				field={dateField}
				bind:value={formHandler.form.seances[manager.selectedSeance].date}
				error={formHandler.errors.date}
				warning={manager.dateWarning} />

			<!--* Start -->
			<Field
				field={{
					inputType: 'time',
					titre: 'Heure du rendez-vous',
					outerCSS: 'col-span-full sm:col-span-2'
				}}
				bind:value={formHandler.form.seances[manager.selectedSeance].start}
				oninput={(e) => {
					let currentSeance = formHandler.form.seances[manager.selectedSeance];
					let relatedEventSeance = ec.getEventById(currentSeance.seance_id).extendedProps.seance;
					console.log('Dates are equal', currentSeance.start === relatedEventSeance.start);
					if (currentSeance.start != relatedEventSeance.start) {
						ec.updateEvent(eventFormater($state.snapshot(currentSeance), patient));
					}
				}}
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
				bind:value={formHandler.form.seances[manager.selectedSeance].duree_custom}
				oninput={(e) => {
					let currentSeance = formHandler.form.seances[manager.selectedSeance];

					ec.updateEvent(eventFormater($state.snapshot(currentSeance), patient));
				}}
				error={formHandler.errors.duree_custom} />
		</FormSection>
		<FormSection titre="Information relative à la tarification">
			<!--* Indemnité -->
			{#if sp.lieu_id === 3 || seance?.lieu_id === 3}
				<Field
					field={checkboxesFields[0]}
					error={formHandler.errors?.[checkboxesFields[0].name]}
					bind:value={formHandler.form.seances[manager.selectedSeance][checkboxesFields[0].name]} />
			{/if}
			<!--* Rapport écrit -->
			{#await checkIfRapportEcrit then value}
				<!-- promise was fulfilled -->
				{#if ((typeof groupe_id === 'number' && ![0, 6, 7].includes(groupe_id)) || !groupe_id) && !value}
					<Field
						field={checkboxesFields[1]}
						error={formHandler.errors?.[checkboxesFields[1].name]}
						bind:value={
							formHandler.form.seances[manager.selectedSeance][checkboxesFields[1].name]
						} />
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
						bind:value={
							formHandler.form.seances[manager.selectedSeance][checkboxesFields[2].name]
						} />
				{/if}
			{:catch error}
				{error}
			{/await}
			<Field
				field={checkboxesFields[3]}
				error={formHandler.errors?.[checkboxesFields[3].name]}
				bind:value={formHandler.form.seances[manager.selectedSeance][checkboxesFields[3].name]} />
			{#if !patient.bim}
				{#if !appState.user.conventionne}
					<TarifField
						bind:form={formHandler.form.seances[manager.selectedSeance]}
						errors={formHandler.errors}
						{tarifs}
						seance={formHandler.form.seances[manager.selectedSeance].seanceType === 'kiné'}
						consultatif={formHandler.form.seances[manager.selectedSeance].seanceType === 'consult'}
						seconde_seance={formHandler.form.seances[manager.selectedSeance].seanceType ===
							'seconde'}
						indemnite={formHandler.form.seances[manager.selectedSeance].indemnite &&
							formHandler.form.seances[manager.selectedSeance].seanceType !== 'no-show'}
						rapport={formHandler.form.seances[manager.selectedSeance].rapport_ecrit &&
							formHandler.form.seances[manager.selectedSeance].seanceType !== 'no-show'}
						intake={formHandler.form.seances[manager.selectedSeance].intake &&
							formHandler.form.seances[manager.selectedSeance].seanceType !== 'no-show'}
						no_show={formHandler.form.seances[manager.selectedSeance].seanceType === 'no-show'} />
				{/if}
				<SupplementField
					bind:value={formHandler.form.seances[manager.selectedSeance].supplements}
					errors={formHandler.errors?.supplements}
					{supplements} />
				<TarifsListField
					label="Suppléments ponctuels"
					key="supplements_ponctuels"
					bind:tarifList={formHandler.form.seances[manager.selectedSeance].supplements_ponctuels}
					addButtonLabel="Ajouter un supplément ponctuel"
					removeButtonLabel="Supprimer"
					addButtonHandler={async (e) => {
						e.preventDefault();
						formHandler.form.seances[manager.selectedSeance].supplements_ponctuels = [
							...formHandler.form.seances[manager.selectedSeance].supplements_ponctuels,
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
	{/if}
	<SubmitButton id="seance-submit" className="col-span-full" />
</Form>

<!-- {JSON.stringify(formHandler.form.seances[manager.selectedSeance])} -->
