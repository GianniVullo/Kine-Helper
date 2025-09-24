<script>
	import CardTable from '../../../lib/components/CardTable.svelte';
	import { onMount } from 'svelte';
	import { t } from '../../../lib/i18n';
	import { goto } from '$app/navigation';
	import PageTitle from '../../../lib/cloud/components/layout/PageTitle.svelte';
	import TwUiField from '../../../lib/components/forms/fields/TwUIField.svelte';
	import { magnifyingGlassIcon } from '../../../lib/ui/svgs/IconSnippets.svelte';

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
	<PageTitle className="w-full" titre={$t('sidebar', 'patients', {}, 'Patients')}>
		<div class="flex flex-col items-start sm:flex-row">
			<div class="mt-3 flex sm:mt-0 sm:ml-4">
				<div class="-mr-px grid grow grid-cols-1 focus-within:relative">
					<TwUiField
						inputType="text"
						name="query"
						outerCSS="mt-0"
						className="col-start-1 row-start-1"
						leading={magnifyingGlassIcon}
						leadingCSS="pointer-events-none size-5 text-gray-400 dark:text-white sm:size-4"
						bind:this={inputQuery}
						id="query"
						oninput={filterPatients}
						aria-label={$t('patients.list', 'search')}
						placeholder={$t('patients.list', 'search')} />
				</div>
			</div>
			<div class="mt-3 sm:mt-0 sm:ml-4">
				<a
					href="/dashboard/patients/create"
					class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>{$t('patients.list', 'add')}</a>
			</div>
		</div>
	</PageTitle>
	<!--* PATIENTS TABLE -->
	<!-- {#await patientsCallback}
		loading
	{:then patientList} -->
	<CardTable>
		{#snippet header()}
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0"
				>{$t('patients.list', 'tableHeaders.name', {}, 'Name')}</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
				>{$t('patients.list', 'tableHeaders.address', {}, 'Address')}</th>
			<!-- <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
				>{$t('patients.list', 'tableHeaders.status', {}, 'Status')}</th> -->
			<!-- <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
			>Comptabilité</th> -->
			<th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-0">
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
					<td class="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
						<div class="flex items-center">
							<div class="ml-4">
								<div class="font-medium">{patient.nom} {patient.prenom}</div>
								<div class="mt-1 text-gray-500 dark:text-gray-400">
									{patient.tel ??
										patient.email ??
										$t('patients.list', 'noContact', {}, 'no contact info')}
								</div>
							</div>
						</div>
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
						<div>{patient.adresse}</div>
						<div class="mt-1 text-gray-500 dark:text-gray-400">{patient.cp} {patient.localite}</div>
					</td>
					<!-- <td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
						<span
							class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset"
							>{$t('patients.list', 'active', {}, 'Active')}</span>
					</td> -->
					<!-- <td class="whitespace-nowrap px-3 py-5 text-sm text-gray-500 dark:text-gray-400">Member</td> -->
					<td
						class="relative py-5 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
						<p class="mr-4 text-indigo-600 hover:text-indigo-900">
							{$t('patients.list', 'consult', {}, 'Consult')}<span class="sr-only"
								>, {patient.nom} {patient.prenom}</span>
						</p>
					</td>
				</tr>
			{/each}
		{/snippet}
	</CardTable>
	<!-- {/await} -->
</main>
