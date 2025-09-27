<script>
	// import EventCalendar from '$lib/EventCalendar.svelte';
	import dayjs from 'dayjs';
	import { t } from '../../../lib/i18n';
	import { appState } from '../../../lib/managers/AppState.svelte';
	import PageTitle from '../../../lib/cloud/components/layout/PageTitle.svelte';
	import EventCalendar from '../../../lib/EventCalendar.svelte';
	import { eventFormater } from '../../../lib/utils/calendarEventFormater';
	import { pushState } from '$app/navigation';

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
	const modal = (info) => {
		pushState('', {
			modal: {
				title: $t(
					'agenda',
					'sessionFor',
					{ patientName: info.event.title },
					`Session for ${info.event.title}`
				),
				buttonTextConfirm: $t('agenda', 'viewSP', {}, 'View pathological situation'),
				href: `/dashboard/patients/${info.event.extendedProps.seance.patient_id}/situation-pathologique/${info.event.extendedProps.seance.sp_id}`,
				event: info.event
			}
		});
	};
</script>

<PageTitle titre={$t('sidebar', 'agenda', {}, 'Agenda')} />
<div class="mt-12">
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
				modal(info);
			},
			loading(info) {
				console.log('loading', info);
			}
		}} />
</div>
