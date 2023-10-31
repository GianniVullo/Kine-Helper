<script>
	import { patients } from '$lib/stores/PatientStore';
	import { user } from '../../../lib/stores/UserStore';
	import PatientCard from '../../../lib/ui/PatientCard.svelte';

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
			<PatientCard {patient} />
		{/each}
	</div>
</section>
