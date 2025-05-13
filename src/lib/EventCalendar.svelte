<script>
	import { Calendar, TimeGrid, DayGrid, Interaction } from '@event-calendar/core';
	import { locale, t } from './i18n';
	import { get } from 'svelte/store';
	import { appState } from './managers/AppState.svelte';

	let {
		events = undefined,
		eventSources = undefined,
		options,
		ec = $bindable(),
		withoutInteractions = false
	} = $props();

	let plugins = [TimeGrid, DayGrid];
	if (!withoutInteractions) {
		plugins.push(Interaction);
	}
	let base_options = {
		allDaySlot: false,
		view: 'dayGridMonth',
		height: '600px',
		/**
		 ** Pour l'instant l'API n'est plus bonne et utilise l'ancienne Prestine façon de fonctionner
		 ** Il y a un bouton "Nouvelle séances" qui sera suffisant pour l'instant
		 */
		// dateClick: (event) => {
		// 	modalStore.trigger({
		// 		type: 'component',
		// 		component: 'seanceCreationModal',
		// 		meta: {
		// 			event,
		// 			component: ec
		// 		}
		// 	});
		// },
		firstDay: 1,
		// slotHeight: 50,
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
			// button: 'btn btn-sm variant-filled-purple',
			// buttonGroup: 'btn-group variant-filled-purple [&>*+*]:border-white',
			event: 'ec-event !text-purple-500 !bg-purple-50 hover:!bg-purple-100 hover:text-purple-700',
			eventTitle: 'font-semibold text-purple-700',
			toolbar:
				'ec-toolbar flex space-y-2 sm:space-y-0 items-start sm:items-center flex-col sm:flex-row',
			eventBody: 'ec-event-body !flex-row',
			eventTime: 'ec-event-time !mr-2'
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
		selectable: true,
		locale: get(locale),
		eventClick: handleClickOnEvent,
		scrollTime: '06:00:00',
		viewDidMount: (info) => {
			console.log('viewDidMount', info);
			if (defaultView != info.type) {
				console.log('defaultView', info.type);
				appState.db.setItem('defaultView', info.type);
				defaultView = info.type;
			}
		},
		views: {
			timeGridWeek: { pointer: true }
		},
		...options
	};
	if (events) {
		base_options.events = events;
	}
	if (eventSources) {
		base_options.eventSources = eventSources;
	}
	function handleClickOnEvent(info) {
		console.log('eventClick', info);
	}

	let defaultView = new Promise(async (resolve) => {
		let view = await appState.db.getItem('defaultView');
		if (view) {
			resolve(view);
		} else {
			resolve('dayGridMonth');
		}
		resolve('dayGridMonth');
	});
	console.log('the options', base_options);
</script>

{#await defaultView then view}
	<Calendar bind:this={ec} {plugins} options={{ ...base_options, view }} />
{/await}
