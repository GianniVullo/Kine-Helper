<script>
	import { patients } from '$lib/stores/PatientStore';
	import { user } from '$lib/stores/UserStore';
	import PatientCard from '$lib/patient-detail/PatientCard.svelte';
	import { goto } from '$app/navigation';
	import AddPersonIcon from '$lib/ui/svgs/AddPersonIcon.svelte';
	import MagnifyingGlassIcon from '$lib/ui/svgs/MagnifyingGlassIcon.svelte';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let searchQuery = '';
	let inputQuery;
	let timeOut;
	let loading = false;

	onMount(() => inputQuery.focus());

	function filterPatients(event) {
		clearTimeout(timeOut);
		timeOut = setTimeout(() => {
			searchQuery = event.target.value;
			// Trigger any action that should be taken after input has stabilized
		}, 250); // Debounce time in milliseconds
	}

	$: filteredPatients = $patients.filter(
		(patient) =>
			(searchQuery.length > 0 &&
				(patient.nom.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
					patient.prenom.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
					patient.localite.toLowerCase().startsWith(searchQuery.toLowerCase()))) ||
			searchQuery.length == 0
	);
	console.log($patients);
	console.log($user);
</script>

<main class="flex flex-col items-center justify-start" style="scrollbar-gutter: stable;">
	<div
		data-has-input={searchQuery.length !== 0}
		class="md:justify group z-0 flex w-full flex-col items-center justify-center p-4 pb-6 duration-200 ease-out md:flex-row md:items-start">
		<div class="flex w-auto items-start md:w-1/3">
			<a
				href="/dashboard/patients/create"
				class="variant-outline-secondary btn flex items-start justify-start">
				<AddPersonIcon class="mr-4 h-6" />
				Ajouter un patient
			</a>
		</div>

		<div
			class="mb-4 flex justify-center rounded-b-[40px] border-b-4 border-surface-300/50 pb-6 duration-500 group-hover:border-surface-300 dark:border-surface-700/50 group-hover:dark:border-surface-700 md:mb-0 md:w-1/3">
			<div class="relative">
				<input
					bind:this={inputQuery}
					on:input={filterPatients}
					autocomplete="off"
					placeholder="Chercher un patient..."
					f
					class="max-w-[300px] rounded border bg-white p-2 pl-10 text-black transition duration-200 group-hover:border-purple-400" />
				<MagnifyingGlassIcon
					class="absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 transform stroke-gray-400 duration-200 group-hover:stroke-gray-800 group-hover:stroke-2" />
			</div>
		</div>
		<div class="w-1/3"></div>
	</div>
	<section class="mt-6 w-full px-12 py-6 opacity-100 duration-300 md:mt-0">
		<h1 class="mb-2 text-lg text-surface-500 dark:text-surface-400">Résultats</h1>
		<div data-sveltekit-preload-data="false" class="flex flex-wrap gap-4">
			{#each filteredPatients as patient (patient.patient_id)}
				<a
					href={`/dashboard/patients/${patient.patient_id}`}
					animate:flip={{ duration: 500, easing: cubicOut }}>
					<PatientCard {patient} {loading} />
				</a>
			{/each}
		</div>
		<!-- <a href="/dashboard/patients/test-patient" class="">hidden</a> -->
	</section>
</main>
