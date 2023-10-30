<script>
	export let todaysAppointments = [];

	function cancelAppointment(id) {
		// Implement the logic to cancel an appointment based on its ID
		// This might involve updating the backend and then updating local state
	}

	function editAppointment(id) {
		// Implement the logic to edit an appointment
		// This could open a modal or navigate to an edit page
	}
</script>

<section>
	<h2 class="text-xl font-semibold mb-4">Rendez-vous d'aujourd'hui</h2>

	{#each todaysAppointments as appointment (appointment.id)}
		<div class="p-4 flex flex-col justify-between items-start bg-white mb-4 rounded-lg">
			<div class="flex-1">
				<p class="font-bold">{appointment.patientName}</p>
				<p>{appointment.timeSlot}</p>
				<p>{appointment.sessionType}</p>
			</div>

			<div class="">
				<button
					class="text-blue-500 hover:text-blue-600"
					on:click={() => editAppointment(appointment.id)}>Modifier</button>
				<button
					class="text-red-500 hover:text-red-600"
					on:click={() => cancelAppointment(appointment.id)}>Annuler</button>
			</div>
		</div>
	{/each}
</section>

<style>
</style>
