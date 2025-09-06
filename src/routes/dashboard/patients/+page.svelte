<script>
	import CardTable from '../../../lib/components/CardTable.svelte';
	import { onMount } from 'svelte';
	import { t } from '../../../lib/i18n';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let searchQuery = $state('');
	let inputQuery;
	let timeOut;

	onMount(() => inputQuery.focus());

	function filterPatients(event) {
		clearTimeout(timeOut);
		timeOut = setTimeout(() => {
			searchQuery = event.target.value;
			// Trigger any action that should be taken after input has stabilized
		}, 250); // Debounce time in milliseconds
	}

	// let patients = $state();
	// let patientsCallback = listPatients(appState.user).then((v) => {
	// 	patients = v;
	// });

	let filteredPatients = $derived.by(() => {
		return data.patients.filter(
			(patient) =>
				(searchQuery.length > 0 &&
					(patient.nom.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
						patient.prenom?.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
						patient.localite?.toLowerCase().startsWith(searchQuery.toLowerCase()))) ||
				searchQuery.length == 0
		);
	});
</script>

<main
	class="flex h-full w-full flex-col items-center justify-start"
	style="scrollbar-gutter: stable;">
	<!--* HEADING -->
	<div class="w-full bg-white md:flex md:items-center md:justify-between">
		<div class="min-w-0 flex-1">
			<h2 class="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
				{$t('sidebar', 'patients', {}, 'Patients')}
			</h2>
		</div>
		<div class="flex flex-col items-start sm:flex-row">
			<div class="mt-3 flex sm:ml-4 sm:mt-0">
				<div class="-mr-px grid grow grid-cols-1 focus-within:relative">
					<input
						type="text"
						name="query"
						bind:this={inputQuery}
						id="query"
						oninput={filterPatients}
						aria-label={$t('patients.list', 'search')}
						class="col-start-1 row-start-1 block w-full rounded-l-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:pl-9 sm:text-sm/6"
						placeholder={$t('patients.list', 'search')} />
					<svg
						class="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
						viewBox="0 0 16 16"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon">
						<path
							fill-rule="evenodd"
							d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
							clip-rule="evenodd" />
					</svg>
				</div>
				<button
					type="button"
					class="flex shrink-0 items-center gap-x-1.5 rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50 focus:relative focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600">
					<svg
						class="-ml-0.5 size-4 text-gray-400"
						viewBox="0 0 16 16"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon">
						<path
							fill-rule="evenodd"
							d="M2 2.75A.75.75 0 0 1 2.75 2h9.5a.75.75 0 0 1 0 1.5h-9.5A.75.75 0 0 1 2 2.75ZM2 6.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5A.75.75 0 0 1 2 6.25Zm0 3.5A.75.75 0 0 1 2.75 9h3.5a.75.75 0 0 1 0 1.5h-3.5A.75.75 0 0 1 2 9.75ZM9.22 9.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v5.69a.75.75 0 0 1-1.5 0V8.56l-.97.97a.75.75 0 0 1-1.06 0Z"
							clip-rule="evenodd" />
					</svg>
					{$t('patients.list', 'sort', {}, 'Sort')}
				</button>
			</div>
			<div class="mt-3 sm:ml-4 sm:mt-0">
				<a
					href="/dashboard/patients/create"
					class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>{$t('patients.list', 'add')}</a>
			</div>
		</div>
	</div>

	<!--* PATIENTS TABLE -->
	<!-- {#await patientsCallback}
		loading
	{:then patientList} -->
	<CardTable>
		{#snippet header()}
			<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
				>{$t('patients.list', 'tableHeaders.name', {}, 'Name')}</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{$t('patients.list', 'tableHeaders.address', {}, 'Address')}</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{$t('patients.list', 'tableHeaders.status', {}, 'Status')}</th>
			<!-- <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
			>Comptabilité</th> -->
			<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
				<span class="sr-only">{$t('patients.detail', 'consult', {}, 'Consultation')}</span>
			</th>
		{/snippet}
		{#snippet body()}
			{#each filteredPatients as patient (patient.patient_id)}
				<tr
					onclick={() => {
						goto(`/dashboard/patients/${patient.patient_id}`);
					}}
					class="cursor-pointer duration-300 ease-out hover:scale-[101%]">
					<td class="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
						<div class="flex items-center">
							<div class="ml-4">
								<div class="font-medium text-gray-900">{patient.nom} {patient.prenom}</div>
								<div class="mt-1 text-gray-500">
									{patient.tel ?? patient.email ?? $t('patients.list', 'noContact', {}, 'no contact info')}
								</div>
							</div>
						</div>
					</td>
					<td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
						<div class="text-gray-900">{patient.adresse}</div>
						<div class="mt-1 text-gray-500">{patient.cp} {patient.localite}</div>
					</td>
					<td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
						<span
							class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
							>{$t('patients.list', 'active', {}, 'Active')}</span>
					</td>
					<!-- <td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500">Member</td> -->
					<td
						class="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
						<p class="mr-4 text-indigo-600 hover:text-indigo-900">
							{$t('patients.list', 'consult', {}, 'Consult')}<span class="sr-only">, {patient.nom} {patient.prenom}</span>
						</p>
					</td>
				</tr>
			{/each}
		{/snippet}
	</CardTable>
	<!-- {/await} -->
</main>
