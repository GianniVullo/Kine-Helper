<script>
	let { patients, onPatientClick, selectedPatient } = $props();

	console.log('patientsselectedPatient', selectedPatient);
</script>

<nav class="flex flex-1 flex-col" aria-label="Sidebar">
	<ul role="list" class="-mx-2 flex w-full flex-col space-y-1">
		{#each patients as { patient, attestations }, index}
			<li>
				<!-- Current: "bg-gray-50 text-indigo-600", Default: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50" -->
				<button
					onclick={() => {
						onPatientClick({ patient, attestations });
					}}
					class={[
						'group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
						...(selectedPatient?.patient?.patient_id === patient.patient_id
							? ['bg-gray-50 text-indigo-600']
							: ['text-gray-700 hover:bg-gray-50 hover:text-indigo-600'])
					]}>
					{patient.nom + ' ' + patient.prenom}
					<span
						class="ml-auto w-9 min-w-max rounded-full bg-white px-2.5 py-0.5 text-center text-xs/5 font-medium whitespace-nowrap text-gray-600 ring-1 ring-gray-200 ring-inset"
						aria-hidden="true">{Object.values(attestations).flat().length}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>
