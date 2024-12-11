<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import index from '@event-calendar/interaction';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { locale, t } from './i18n';
	import { get } from 'svelte/store';

	const modalStore = getModalStore();

	let { events = undefined, eventSource = undefined, options, ec } = $props();

	let plugins = [TimeGrid, DayGrid, index];
	let base_options = {
		allDaySlot: false,
		view: 'dayGridMonth',
		dateClick: (event) => {
			modalStore.trigger({
				type: 'component',
				component: 'seanceCreationModal',
				meta: {
					event,
					component: ec
				}
			});
		},
		firstDay: 1,
		slotHeight: 50,
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
		// Decided that it was ugly like this
		theme: (theme) => ({
			...theme,
			// day: 'ec-day !bg-surface-100 dark:!bg-surface-800',
			// body: 'ec-body h-96',
			// button: 'btn btn-sm variant-filled-primary',
			// buttonGroup: 'btn-group variant-filled-primary [&>*+*]:border-white',
			event: 'ec-event !text-primary-500 !bg-primary-50 hover:!bg-primary-100 hover:text-primary-700',
			eventTitle: 'font-semibold text-primary-700',
			toolbar: 'ec-toolbar flex space-y-2 sm:space-y-0 items-start sm:items-center flex-col sm:flex-row'
			// timeGrid: 'ec-time-grid !h-20',
			// time: 'ec-time !h-20',
			// line: 'ec-line'
			// title: 'ec-title md:py-0 py-2',
			// toolbar: 'ec-toolbar flex-wrap'
		}),
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		events: events,
		selectable: true,
		select(info) {
			console.log(info);
			// NOT READY TO GO TO PRODUCTION
			// const modal = {
			// 	type: 'component',
			// 	component: 'multipleEventSelection',
			// 	meta: {
			// 		info: info,
			// 		component: ec
			// 	}
			// };
			// modalStore.trigger(modal)
		},
		eventSource: eventSource,
		locale: get(locale),
		eventClick: handleClickOnEvent,
		scrollTime: '08:00:00',
		views: {
			timeGridWeek: { pointer: true }
		},
		...options
	};
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
</script>

<Calendar {plugins} options={base_options} />
