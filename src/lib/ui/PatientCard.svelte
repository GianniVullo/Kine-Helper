<script>
	export let patient = {}; // Patient object passed as a prop

	function update(event) {
		// Updating patient
	}

	function erase(event) {
		// Delete patient
	}
</script>

<div
	class="group flex w-full cursor-default justify-between rounded-lg p-4 duration-200 hover:shadow sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
	<div>
		<h2 class="text-md font-medium">{patient.nom} {patient.prenom}</h2>
		<p class="text-xs text-gray-500">{patient.adresse},</p>
		<p class="text-xs text-gray-500">{patient.cp} {patient.localite}</p>
		<a
			class="text-sm text-gray-700 duration-200 hover:!text-green-700 group-hover:text-green-600"
			href={`/dashboard/medical-files/patients/${patient.patient_id}`}>Voir le dossier médical</a>
	</div>
	<button on:click={update}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="h-6 w-6 cursor-pointer stroke-transparent duration-200 ease-in-out hover:!stroke-yellow-700 group-hover:stroke-blue-500">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
		</svg>
	</button>
</div>
