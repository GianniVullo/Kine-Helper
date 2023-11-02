<script>
	import { patients } from '$lib/stores/PatientStore';
	import { user } from '$lib/stores/UserStore';
	import PatientCard from '$lib/patient-detail/PatientCard.svelte';
	import AddPersonIcon from '$lib/ui/svgs/AddPersonIcon.svelte';
	import MagnifyingGlassIcon from '$lib/ui/svgs/MagnifyingGlassIcon.svelte';
	import { onMount } from 'svelte';

	let searchInput;
	let searchQuery = '';

	onMount(() => searchInput.focus())

	$: filteredPatients = $patients.filter(
		(patient) =>
			(searchQuery.length > 0 &&
			(patient.nom.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
				patient.prenom.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
				patient.localite.toLowerCase().startsWith(searchQuery.toLowerCase())))
				|| searchQuery == '*'
	);
	console.log($patients);
	console.log($user);
</script>

<main>
	<div
		data-has-input={searchQuery.length !== 0}
		class="absolute group p-4 rounded-[40px] bg-white data-[has-input=true]:bg-white/0 data-[has-input=true]dark:bg-white/0 data-[has-input=false]:dark:bg-surface-700 h-44 right-[50%] ml-auto mr-auto flex justify-center items-center w-60 sm:w-96 translate-x-[50%] translate-y-[-50%] flex-col duration-200 data-[has-input=true]:top-36 z-50 data-[has-input=true]:md:top-24 data-[has-input=false]:top-[40%] ease-out">
		<h1 class="text-xl font-medium text-surface-300 mb-4 self-start group-data-[has-input=true]:hidden">Ça commence ici...</h1>
		<div  class="relative w-full mb-4">
			<input
				bind:value={searchQuery}
				bind:this={searchInput}
				autocomplete="off"
				placeholder="Chercher un patient..."f
				class="w-full rounded border bg-white p-2 pl-10 text-black transition duration-200 group-hover:border-purple-400" />
			<MagnifyingGlassIcon
				class="absolute left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 transform stroke-gray-400 duration-200 group-hover:stroke-gray-800 group-hover:stroke-2" />
		</div>
		<a href="/dashboard/patients/create" class="variant-outline-secondary flex items-start justify-start btn"> 
			<AddPersonIcon class="h-6 w- mr-4" />
			Ajouter un patient 
		</a>
	</div>
	<section class:!opacity-0={searchQuery.length === 0} class="p-12 mt-52 md:mt-40 opacity-100 duration-300">
		<h1 class="text-lg text-surface-500 dark:text-surface-400 mb-2">Résultats</h1>
		<div class="flex flex-wrap gap-4">
			{#each filteredPatients as patient}
				<PatientCard {patient} />
				<!-- {:else} -->
			{/each}
		</div>
	</section>
</main>
