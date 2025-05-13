<script>
	// import EventCalendar from '$lib/EventCalendar.svelte';
	import dayjs from 'dayjs';
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { locale, t } from '../../../lib/i18n';
	import { get } from 'svelte/store';
	import { NomenclatureManager } from '../../../lib/utils/nomenclatureManager';
	import { appState } from '../../../lib/managers/AppState.svelte';
	import PageTitle from '../../../lib/ui/PageTitle.svelte';
	import EventCalendar from '../../../lib/EventCalendar.svelte';
	import Modal from '../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { page } from '$app/state';
	import { eventFormater } from '../../../lib/utils/calendarEventFormater';
	import { openModal } from '../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { goto } from '$app/navigation';

	let ec = $state();

	async function queryMonthEvents(start, end) {
		let { data: seances, error } = await appState.db.select(
			'SELECT * from seances WHERE date BETWEEN date($1) AND date($2) AND user_id = $3',
			[dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD'), appState.user.id]
		);
		if (error) {
			console.error(error);
		}
		let events = [];
		if (seances.length === 0) {
			return events;
		}
		if (error) {
			console.error(error);
			return;
		}
		for (const seance of seances) {
			const { data: patientList, error: patientQueryError } = await appState.db.select(
				'SELECT * from patients WHERE patient_id = $1',
				[seance.patient_id]
			);
			let patient = patientList[0];
			events.push(eventFormater(seance, patient));
		}
		return events;
	}
</script>

<Modal
	opened={page.state.modal?.name === 'eventCalendarOnclick'}
	title={page.state.modal?.title}
	body=""
	leading={undefined}
	buttonTextConfirm="Voir la situation pathologique"
	buttonTextConfirmCSS="!bg-blue-500 !text-white"
	onAccepted={() => {
		goto(
			`/dashboard/patients/${page.state.modal.event.extendedProps.seance.patient_id}/situation-pathologique/${page.state.modal.event.extendedProps.seance.sp_id}`
		);
	}} />

<PageTitle titre="Agenda" />
<EventCalendar
	bind:ec
	eventSources={[
		{
			events(fetchInfo, successCallback, failureCallback) {
				console.log('In the events list function', fetchInfo);
				queryMonthEvents(fetchInfo.start, fetchInfo.end).then((events) => {
					successCallback(events);
				});
			}
		}
	]}
	options={{
		eventClick(info) {
			console.log('eventClick', info);
			openModal({
				name: 'eventCalendarOnclick',
				title: `Séance pour ${info.event.title}`,
				event: info.event
			});
		},
		loading(info) {
			console.log('loading', info);
		}
	}} />
