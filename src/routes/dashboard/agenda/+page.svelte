
En construction
<!-- <script>
	// import EventCalendar from '$lib/EventCalendar.svelte';
	import dayjs from 'dayjs';
	import { LocalDatabase } from '../../../lib/stores/databaseInitializer';
	import { user } from '../../../lib/stores/UserStore';
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { locale, t } from '../../../lib/i18n';
	import { get } from 'svelte/store';
	import { NomenclatureManager } from '../../../lib/utils/nomenclatureManager';
	import { patients } from '../../../lib/stores/PatientStore';


	let plugins = [TimeGrid, DayGrid];
	function handleClickOnEvent(info) {
		console.log(info);
		const modal = {
			type: 'component',
			component: 'calendarEvent',
			meta: {
				event: info.event,
				component: ec
			}
		};

		modalStore.trigger(modal);
	}

	let ec;
	$effect(() => {
		if (ec) {
			console.log('the ec', ec);
		}
	});

	async function queryMonthEvents(start, end) {
		let db = new LocalDatabase();
		let seances = await db.select(
			'SELECT * from seances WHERE date BETWEEN date($1) AND date($2) AND user_id = $3',
			[dayjs(start).format('YYYY-MM-DD'), dayjs(end).format('YYYY-MM-DD'), $user.user.id]
		);
		let nomeclatureManager = new NomenclatureManager();
		let events = [];
		const durations = await nomeclatureManager.durationGuesser(seances);
		for (const seance of seances) {
			const patient = $patients.find((p) => p.patient_id === seance.patient_id);
			events.push({
				id: seance.seance_id,
				// resourceIds: '',
				// allDay: false,
				start: dayjs(seance.date).toDate(),
				end: dayjs(seance.date).add(durations[seances.indexOf(seance)], 'minute').toDate(),
				title: patient.nom + ' ' + patient.prenom,
				editable: false,
				startEditable: false,
				durationEditable: false,
				backgroundColor: 'rgb(168,85,247)',
				textColor: '#dbdee9',
				extendedProps: {
					seance: seance
				}
			});
		}
		return events;
	}
	let base_options = {
		allDaySlot: false,
		view: 'dayGridMonth',
		buttonText: {
			close: get(t)('shared', 'close'),
			dayGridMonth: get(t)('shared', 'month'),
			listDay: get(t)('shared', 'list'),
			listMonth: get(t)('shared', 'list'),
			listWeek: get(t)('shared', 'list'),
			listYear: get(t)('shared', 'list'),
			resourceTimeGridDay: get(t)('shared', 'day'),
			resourceTimeGridWeek: get(t)('shared', 'week'),
			timeGridDay: get(t)('shared', 'day'),
			timeGridWeek: get(t)('shared', 'week'),
			today: get(t)('shared', 'today')
		},
		theme: (theme) => ({
			...theme,
			day: 'ec-day !bg-surface-100 dark:!bg-surface-800',
			body: 'ec-body h-[80vh]',
			button: 'btn btn-sm variant-filled-primary',
			buttonGroup: 'btn-group variant-filled-primary [&>*+*]:border-white',
			event: 'ec-event text-success-400 bg-surface-100 dark:border-white border-black border',
			title: 'ec-title md:py-0 py-2',
			toolbar: 'ec-toolbar flex-wrap'
		}),
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		eventSources: [
			{
				events(fetchInfo, successCallback, failureCallback) {
					console.log('In the events list function', fetchInfo);
					queryMonthEvents(fetchInfo.start, fetchInfo.end).then((events) => {
						successCallback(events);
					});
					// new Promise(async (resolve, reject) => {
					// 	console.log('In the promise');
					// 	const es = await queryMonthEvents();
					// 	console.log('Events', es);
					// 	resolve();
					// });
				}
			}
		],
		eventClick: handleClickOnEvent,
		scrollTime: '08:00:00',
		locale: get(locale),
		views: {
			timeGridWeek: { pointer: true }
		}
	};
</script>

<div class="h-full p-4">
	<h1 class="mb-4 text-lg text-surface-400">Agenda</h1>
	<Calendar bind:this={ec} {plugins} options={base_options} />
</div> -->
