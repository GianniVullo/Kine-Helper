<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';

	export let events;
	export let options;
	let plugins = [TimeGrid, DayGrid];
	let fking_options = {
		view: 'timeGridDay',
		buttonText: {
			close: 'Fermer',
			dayGridMonth: 'Mois',
			listDay: 'Liste',
			listMonth: 'Liste',
			listWeek: 'Liste',
			listYear: 'Liste',
			resourceTimeGridDay: 'Jour',
			resourceTimeGridWeek: 'Semaine',
			timeGridDay: 'Jour',
			timeGridWeek: 'Semaine',
			today: "Aujourd'hui"
		},
		theme: {
			active: 'ec-active',
			allDay: 'ec-all-day',
			bgEvent: 'ec-bg-event',
			bgEvents: 'ec-bg-events',
			body: 'ec-body',
			button: 'bg-purple-400 px-4 py-2 text-white hover:bg-purple-500 rounded-lg group-[.is-ec-group]:first:border-r group-[.is-ec-group]:last:border-l group-[.is-ec-group]:first:!rounded-l-lg group-[.is-ec-group]:first:!rounded-r-none group-[.is-ec-group]:rounded-none group-[.is-ec-group]:last:!rounded-r-lg group-[.is-ec-group]:last:!rounded-l-none',
			buttonGroup: 'inline-flex is-ec-group group',
			calendar: 'ec',
			compact: 'ec-compact',
			content: 'ec-content',
			day: 'ec-day',
			dayFoot: 'ec-day-foot',
			dayHead: 'ec-day-head',
			daySide: 'ec-day-side',
			days: 'ec-days',
			draggable: 'ec-draggable',
			dragging: 'ec-dragging',
			event: 'ec-event',
			eventBody: 'ec-event-body',
			eventTag: 'ec-event-tag',
			eventTime: 'ec-event-time',
			eventTitle: 'ec-event-title',
			events: 'ec-events',
			extra: '',
			ghost: 'ec-ghost',
			handle: 'ec-handle',
			header: 'ec-header',
			hiddenScroll: 'ec-hidden-scroll',
			highlight: 'ec-highlight',
			icon: 'ec-icon',
			line: 'ec-line',
			lines: 'ec-lines',
			noEvents: 'ec-no-events',
			nowIndicator: 'ec-now-indicator',
			otherMonth: 'ec-other-month',
			pointer: 'ec-pointer',
			popup: 'ec-popup',
			preview: 'ec-preview',
			resizer: 'ec-resizer',
			resizingX: 'ec-resizing-x',
			resizingY: 'ec-resizing-y',
			resource: 'ec-resource',
			resourceTitle: 'ec-resource-title',
			selecting: 'ec-selecting',
			sidebar: 'ec-sidebar',
			sidebarTitle: 'ec-sidebar-title',
			time: 'ec-time',
			title: 'ec-title',
			today: 'ec-today',
			toolbar: 'ec-toolbar',
			uniform: 'ec-uniform',
			view: '',
			weekdays: ['ec-sun', 'ec-mon', 'ec-tue', 'ec-wed', 'ec-thu', 'ec-fri', 'ec-sat'],
			withScroll: 'ec-with-scroll'
		},
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		events: events,
		// eventSource: events,
		eventClick: handleClickOnEvent,
		...options
	};
	console.log(events);
	console.log(fking_options);
	function handleClickOnEvent(info) {
		console.log(info);
	}
</script>

{#if events.length > 0}
	<Calendar {plugins} options={fking_options} />
{:else}
	<p>Aucuns rendez-vous enregistrer jusqu'à présent :)</p>
{/if}
