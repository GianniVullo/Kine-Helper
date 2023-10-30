<script>
	export let onSearch = (filters) => {}; // Callback when a search is performed

	let searchTerm = '';
	let selectedSessionType = '';
	let selectedDate = '';

	let isFocused = false;
	function performSearch() {
		onSearch({
			term: searchTerm,
			sessionType: selectedSessionType,
			date: selectedDate
		});
	}
</script>

<aside class:!w-full={isFocused} class="w-44 h-12 flex duration-500 overflow-hidden items-center">
	<!-- Search Section -->
	<div class="relative min-w-[160px] group mr-4">
		<input
			on:focus={() => (isFocused = true)}
			bind:value={searchTerm}
			placeholder="Recherche..."
			class="pl-10 p-2 w-full peer focus:outline-none focus:border-purple-400 focus:bg-white rounded bg-blue-50 text-black group-hover:bg-white group-hover:border-purple-400 border transition duration-200" />
		<!-- Inline SVG for magnifying glass icon -->
		<svg
			class="absolute top-1/2 left-2.5 transform -translate-y-1/2 w-5 h-5 stroke-gray-400 peer-focus:stroke-gray-800 peer-focus:stroke-2 group-hover:stroke-gray-800 group-hover:stroke-2 duration-200"
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
	<!-- Filters -->
	<div class="mr-4 flex items-center">
		<label for="sessionType" class="block mr-2 font-medium">Type d'évènement</label>
		<select
			bind:value={selectedSessionType}
			id="sessionType"
			class="border rounded px-2 py-1 w-full">
			<option value="">Tous</option>
			<option value="kine">Séance de kiné</option>
			<option value="autre">autre</option>
			<!-- Add more options based on your session types -->
		</select>
	</div>

	<div class="mr-4 flex items-center">
		<label for="date" class="block mr-2 font-medium">Date</label>
		<input
			type="date"
			bind:value={selectedDate}
			id="date"
			class="border rounded px-2 py-1 w-full" />
	</div>

	<button
		class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
		on:click={performSearch}>
		Rechercher
	</button>
    <button on:click={() => isFocused = false} class="p-2 rounded-full ml-2 hover:scale-110 bg-blue-50">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          
    </button>
</aside>
