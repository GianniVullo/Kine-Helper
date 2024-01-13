<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import DayGrid from '@event-calendar/day-grid';
	import {} from '@event-calendar/interaction';

	export let events;
	export let options;
	export let ec;
	let plugins = [TimeGrid];
	let base_options = {
		view: 'timeGridWeek',
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
		theme: (theme) => ({
			...theme,
			day: 'ec-day !bg-surface-100 dark:!bg-surface-800',
			body: 'ec-body h-96',
			button: 'btn btn-sm variant-filled-primary',
			buttonGroup: 'btn-group variant-filled-primary [&>*+*]:border-white',
			event: 'ec-event text-success-400 bg-surface-100',
			title: 'ec-title md:py-0 py-2',
			toolbar: 'ec-toolbar flex-wrap'
		}),
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		events: events,
		// eventSource: events,
		eventClick: handleClickOnEvent,
		scrollTime: '08:00:00',
		views: {
			timeGridWeek: { pointer: true }
		},
		...options
	};
	function handleClickOnEvent(info) {
		console.log(info);
	}
</script>

<Calendar bind:this={ec} {plugins} options={base_options} />
