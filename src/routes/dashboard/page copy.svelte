<script>
	import { patients } from '$lib/stores/PatientStore';
	import { popup, Autocomplete } from '@skeletonlabs/skeleton';
	import PatientForm from '../../lib/forms/patients/PatientForm.svelte';
	console.log($patients);
	let searchQuery = '';

	// Sample data
	let appointmentsToday = [
		{ name: 'John Doe', time: '10:00', note: 'Contrôle post-opératoire' },
		{ name: 'Jane Smith', time: '11:30', note: 'Évaluation initiale' }
	];

	let pendingPayments = [
		{ name: 'John Doe', amount: '€150', overdue: '5 jours' },
		{ name: 'Jane Smith', amount: '€75', overdue: '2 jours' }
	];

	let tasks = ["Relance avec l'assurance", "Mise à jour de l'inventaire du matériel thérapeutique"];

	let news = [
		'Nouvelle technique de rééducation présentée',
		'La communauté Kiné discute des meilleurs équipements',
		"Retour d'expérience d'une session réussie"
	];

</script>

<PatientForm />
<!-- Button & Search Bar Area -->
<div class="mb-4 flex justify-between p-4">
	<!-- Ajouter un patient button with hover effect -->
	<button class="rounded bg-purple-400 p-2 text-white transition duration-200 hover:bg-purple-500">
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

<!-- Main Content Area -->
<div class="grid grid-cols-3 gap-4 p-4">
	<!-- Rendez-vous d'aujourd'hui -->
	<div class="mb-4 rounded-lg border-2 border-purple-400 bg-white p-5 shadow-md lg:mb-0">
		<h2 class="mb-4 text-lg font-semibold">Rendez-vous d'aujourd'hui</h2>
		<ul>
			{#each appointmentsToday as appt}
				<li class="mb-2">
					<strong>{appt.time}</strong>: {appt.name} - {appt.note}
				</li>
			{/each}
		</ul>
	</div>

	<!-- Paiements en attente -->
	<div class="mb-4 rounded-lg border-2 border-purple-400 bg-white p-5 shadow lg:mb-0">
		<h2 class="mb-4 text-lg font-semibold">Paiements en attente</h2>
		<ul>
			{#each pendingPayments as payment}
				<li class="mb-2">
					{payment.name} doit {payment.amount} ({payment.overdue} en retard)
				</li>
			{/each}
		</ul>
	</div>

	<!-- Nouvelles de la communauté -->
	<div class="test col-span-1 rounded-lg p-2 shadow-inner">
		<h2 class="mb-4 text-lg font-semibold text-purple-600">Nouvelles de la communauté</h2>
		<ul>
			{#each news as item}
				<li class="mb-2 text-gray-600">{item}</li>
			{/each}
		</ul>
	</div>

	<!-- Liste de tâches/Rappels -->
	<div class="card col-span-3">
		<h2 class="mb-4 text-lg font-semibold">Liste de tâches & Rappels</h2>
		<ul>
			{#each tasks as task}
				<li class="mb-2">{task}</li>
			{/each}
		</ul>
	</div>

</div>


<style>
	.test {
		box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.5);
	}
</style>
