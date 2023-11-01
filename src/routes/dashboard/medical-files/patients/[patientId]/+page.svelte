<script>
	import { page } from '$app/stores';
	import { patients } from '$lib/stores/PatientStore';
	let tabs = ['Prescriptions', 'Documents', 'Attestations', 'Séances'];
	let selectedId = tabs[0];

	console.log($page.params);
	console.log($patients.find((values) => values.patient_id == $page.params.patientId));
	$: patient = $patients.find((pat) => pat.patient_id == $page.params.patientId);
</script>

<div>
	<!-- TABBED PANE -->
	{#each patient.situation_pathologiques ?? [] as ps}
		<details class="mb-4 rounded border">
			<summary class="cursor-pointer bg-gray-200 p-4 hover:bg-gray-300">
				{ps.created_at}
			</summary>
			<div class="p-4">
				<!-- Tabbed Panel -->
				<div>
					<div class="mb-4 border-b">
						<button class="px-4 py-2 hover:bg-gray-200">Prescriptions</button>
						<button class="px-4 py-2 hover:bg-gray-200">Documents</button>
						<button class="px-4 py-2 hover:bg-gray-200">Attestations</button>
						<button class="px-4 py-2 hover:bg-gray-200">Séances</button>
					</div>

					<!-- Prescriptions Tab Content -->
					<div>
						{#each ps.prescriptions as prescription}
							<details class="mb-4 rounded border">
								<summary class="cursor-pointer bg-gray-300 p-2 hover:bg-gray-400">
									{prescription.date} - {prescription.prescripteur}
								</summary>
								<div class="p-2">
									<p><strong>Numéro de prescription:</strong> {prescription.prescription_id}</p>
									<p><strong>Prescripteur:</strong> {prescription.prescripteur}</p>
									<!-- ... More attributes here ... -->
								</div>
							</details>
						{/each}
					</div>
					<!-- Other tabs' content would follow a similar structure, adapting for their respective data -->
				</div>
			</div>
		</details>
	{:else}
		Merde
	{/each}
</div>
