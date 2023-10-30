<!-- <script>
	import EventCalendar from '$lib/EventCalendar.svelte';
	import TodaysAppointments from '$lib/agenda/TodaysAppointments.svelte';
  import AgendaSideBar from '../../../lib/agenda/AgendaSideBar.svelte';
	let options = {};
	let todaysAppointments = createEvent()
  function handleSearch(filters) {
    // Update the list of displayed appointments based on the filters
    // This might involve fetching new data or filtering the existing list
  }
  function createEvent() {
		let eve = [];
		for (let index = 0; index < 20; index++) {
			eve.push({
				id: index +1,
				resourceIds: [],
				allDay: false,
				title: 'Jean Dupont',
				start: new Date(2023, 9, 20, index + 1),
				end: new Date(2023, 9, 20, index + 2),
				editable: true,
				startEditable: false,
				durationEditable: false,
				display: 'auto',
				backgroundColor: '#ff573' + `${index +1}`,
				textColor: '#000000',
				extendedProps: {
					timeSlot: '10:00 - 10:30',
					sessionType: 'Consultation initiale'
				}
			});
		}
		return eve;
	};
</script>

<!--! Pour l'instant pas de Sidebar mais à faire -->
<!-- <div class="p-4 flex justify-between">
  <AgendaSideBar onSearch={handleSearch} />
</div>

<div class="p-4">
  <h1 class="text-purple-500 text-lg mb-4">Agenda</h1> -->
	<!-- <TodaysAppointments {todaysAppointments} /> -->
	<!-- <EventCalendar events={todaysAppointments} {options} />
</div> -->
<div>AGENDA</div>