<script>
	import { patients } from '$lib/stores/PatientStore';
	import { user } from '../../../lib/stores/UserStore';

	let searchQuery = '';
	console.log($patients);
	console.log($user);
</script>

<div class="flex p-4">
	<!-- Ajouter un patient button with hover effect -->
	<button
		class="mr-4 rounded bg-purple-400 p-2 text-white transition duration-200 hover:bg-purple-500">
		Ajouter un patient
	</button>

	<!-- Search input with magnifying glass icon and hover effect -->
	<div class="group relative w-1/3">
		<input
			bind:value={searchQuery}
			placeholder="Recherche de patients..."
			class="w-full rounded border bg-white p-2 pl-10 text-black transition duration-200 group-hover:border-purple-400" />
		<!-- Inline SVG for magnifying glass icon -->
		<svg
			class="absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 transform stroke-gray-400 duration-200 group-hover:stroke-gray-800 group-hover:stroke-2"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M21 21l-6-6m2-6a7 7 0 11-14 0 7 7 0 0114 0z"></path>
		</svg>
	</div>
</div>

<section class="p-4">
	<h1>Overview des Patients</h1>

	<div class="flex flex-wrap gap-4">
		{#each $patients as patient}
			<div
				class="group flex justify-between w-full cursor-default rounded-lg p-4 duration-200 hover:shadow sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
				<div>
					<h2 class="text-md font-medium">{patient.nom} {patient.prenom}</h2>
					<!-- <p>{patient.niss}</p> -->
					<p class="text-xs text-gray-500">{patient.adresse},</p>
					<p class="text-xs text-gray-500">{patient.cp} {patient.localite}</p>
					<!-- <p>{patient.email}</p> -->
					<!-- <p>{patient.tel}</p> -->
					<a
						class="text-sm text-gray-700 duration-200 hover:!text-green-700 group-hover:text-green-600"
						href={`/dashboard/medical-files/patients/${patient.patient_id}`}>Voir le dossier médical</a>
				</div>
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
			</div>
		{/each}
	</div>
</section>
