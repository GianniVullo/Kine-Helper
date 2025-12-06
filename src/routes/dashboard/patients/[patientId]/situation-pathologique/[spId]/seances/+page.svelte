<script>
	// import { t } from '../../../../../../../lib/i18n';
	import dayjs from 'dayjs';
	import SectionTitle from '../../../../../../../lib/components/SectionTitle.svelte';
	import BoutonSecondaireAvecIcone from '../../../../../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import {
		addIcon,
		calendarIcon,
		deleteIcon,
		editIcon,
		euroIcon,
		listIcon
	} from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import EventCalendar from '../../../../../../../lib/EventCalendar.svelte';
	import CalendarEventModal from '../../../../../../../lib/ui/CalendarEventModal.svelte';
	import { openDrawer } from '../../../../../../../lib/cloud/libraries/overlays/drawerUtilities.svelte';
	import { page } from '$app/state';
	import Drawer from '../../../../../../../lib/cloud/libraries/overlays/Drawer.svelte';
	import { cloneDeepWith } from 'lodash';
	import CardTable from '../../../../../../../lib/components/CardTable.svelte';
	import { seanceTypes } from '../../../../../../../lib/components/forms/validators/baseValidators';
	import TwDropdown from '../../../../../../../lib/components/TWElements/TWDropdown.svelte';
	import { appState } from '../../../../../../../lib/managers/AppState.svelte';
	import { onMount } from 'svelte';
	import { t } from '../../../../../../../lib/i18n';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { CallBackModal } from '../../../../../../../lib/cloud/libraries/overlays/CallbackModal.svelte';
	import { info } from '../../../../../../../lib/cloud/libraries/logging';

	let { data } = $props();
	let { patient, sp } = data;
	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`;

	sp.seances?.sort((a,b) => new Date(b.date) - new Date(a.date))
	let seances = $state(sp.seances);

	let events = $derived(
		seances.map((seance) => {
			let start = dayjs(seance.date);
			console.log('start', start);

			let end = start
				.add(seance.metadata?.duree_custom ?? seance.minutes, 'minute')
				.format('YYYY-MM-DD HH:mm');
			const event = {
				id: seance.seance_id,
				start: `${seance.date} ${seance.start}`,
				end: end,
				title: patient.nom + ' ' + (patient?.prenom ?? ''),
				editable: false,
				startEditable: false,
				durationEditable: false,
				extendedProps: {
					seance: seance
				}
			};
			console.log('event', event);
			return event;
		})
	);

	const deleteSeance = async (e) => {
		console.log('in the callback method with seanceId');
		const seanceId = e.detail.seanceId;
		try {
			await appState.db.delete('seances', [['seance_id', seanceId]]);
			seances.splice(
				seances.findIndex((p) => p.seance_id == seanceId),
				1
			);
		} catch (error) {
			info('ERROR !');
		}
	};

	let deleteSeanceModal = new CallBackModal(
		{
			title: 'A title',
			body: 'Cela sera définitif'
		},
		deleteSeance
	);

	let display = $state('table');
	let ec = $state();

	function menuItemsList(seance) {
		let seanceDate = dayjs(seance.date).format('YYYY-MM-DD');
		return [
			[
				{
					label: 'Modifier',
					href: `${homeUrl()}/seances/${seance.seance_id}/update`,
					icon: editIcon
				},
				{
					label: get(t)('otherModal', 'calendarcontrols.bill'),
					onclick: () => {
						goto(
							`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create-${seanceDate}`
						);
					},
					icon: euroIcon
				},
				{
					label: get(t)('patients.detail', 'deleteModal.confirm'),
					onclick: (e) => {
						deleteSeanceModal.modal.title = `Êtes-vous sûr de vouloir supprimer la séance du ${seanceDate} ?`;
						deleteSeanceModal.modal.seanceId = seance.seance_id;
						deleteSeanceModal.open(e);
					},
					icon: deleteIcon
				}
			]
		];
	}
	onMount(async () => {
		display = (await appState.db.getItem('spSeanceDisplay')) ?? 'table';
	});
</script>

<Drawer
	opened={page.state.drawer?.name === 'seanceCalendarDetail'}
	title="Votre séance"
	description="Panel de contrôle de votre rendez-vous.">
	<CalendarEventModal {deleteSeance} {ec} />
</Drawer>

<SectionTitle titre={`Séances (${seances?.length})`} className="space-x-3">
	{#snippet actions()}
		<BoutonSecondaireAvecIcone
			onclick={async () => {
				if (display === 'calendar') {
					display = 'table';
					await appState.db.setItem('spSeanceDisplay', 'table');
				} else {
					display = 'calendar';
					await appState.db.setItem('spSeanceDisplay', 'calendar');
				}
			}}
			overiddeIconCSS="size-5 text-gray-900 dark:text-white"
			icon={display === 'calendar' ? listIcon : calendarIcon} />
		<!-- TODO : Remettre ça une fois que ce sera ergonomique -->
		<BoutonSecondaireAvecIcone
			href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create-multiple`}
			inner={'Séances multiples'}
			icon={addIcon} />
		<BoutonPrincipalAvecIcone
			href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create`}
			inner="Séance"
			icon={addIcon} />
	{/snippet}
</SectionTitle>

{#if sp.seances.length > 0}
	<!--* Séances Agenda -->
	<div class="mt-4 flex flex-col">
		{#if display === 'calendar'}
			<EventCalendar
				bind:ec
				{events}
				options={{
					eventClick(info) {
						console.log('eventClick', info);
						const event = cloneDeepWith(info.event, (value) => {
							value.extendedProps.seance = { ...value.extendedProps.seance };
							return value;
						});
						openDrawer({
							name: 'seanceCalendarDetail',
							event: event,
							seance: event.extendedProps.seance
						});
					}
				}} />
		{:else}
			<CardTable>
				{#snippet header()}
					<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Date</th>
					<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">Type</th>
					<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Paiement</th>
					<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
						><span class="sr-only">Status</span></th>
				{/snippet}
				{#snippet body()}
					{#each seances as seance}
						<tr>
							<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
								{dayjs(seance.date).format('DD/MM/YYYY')}
							</td>
							<td class="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
								<div>{seanceTypes[seance.seance_type]}</div>
							</td>
							<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
								<div class="">{seance.is_paid}</div>
							</td>
							<td class="py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0">
								{#if seance.has_been_attested}
									Séance attestée
								{:else}
									<TwDropdown
										className="relative inline-block"
										triggerText="Actions"
										items={menuItemsList(seance)} />
								{/if}
							</td>
						</tr>
					{/each}
				{/snippet}
			</CardTable>
		{/if}
	</div>
{:else}
	Pas de séances pour l'instant
{/if}
