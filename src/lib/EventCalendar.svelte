<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import index from '@event-calendar/interaction';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { locale, t } from './i18n';
	import { get } from 'svelte/store';

	const modalStore = getModalStore();

	export let events;
	export let options = {};
	export let ec;
	let plugins = [TimeGrid, DayGrid, index];
	let base_options = {
		allDaySlot: false,
		view: 'dayGridMonth',
		dateClick: (event) => {
			modalStore.trigger({
				type: 'component',
				component: 'seanceCreationModal',
				meta: {
					event: event,
					component: ec
				}
			});
		},
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
			body: 'ec-body h-96',
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
		// eventSource: events,
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

<Calendar bind:this={ec} {plugins} options={base_options} />
