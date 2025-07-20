<script>
	import { appState } from '../../../lib/managers/AppState.svelte';
	import { DatabaseManager } from '../../../lib/cloud/database';
	import { dummyPatient, modifiedData } from './dummyData';
	import { treatResponse } from './utils';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const patient = dummyPatient(appState.user.id);

	let tests = {
		Remote: {
			'Retrieve a Patient': async () => {
				treatResponse(
					await appState.db.selectRemote(
						'Select * from patients where patient_id = $1',
						[patient.patient_id],
						{
							table: 'patients',
							statement: '*',
							filters: { patient_id: patient.patient_id }
						}
					)
				);
			},
			'Create a Patient': async () => {
				let response = await appState.db.insert('patients', patient);
				treatResponse(response);
			},
			'Update a Patient': async () => {
				// Logic for updating a patient
				console.log('Update a Patient - Not implemented yet');
				treatResponse(
					await appState.db.update('patients', [['patient_id', patient.patient_id]], modifiedData)
				);
			},
			'Delete a Patient': async () => {
				// Logic for deleting a patient
				console.log('Delete a Patient - Not implemented yet');
				treatResponse(await appState.db.delete('patients', [['patient_id', patient.patient_id]]));
			}
		},
		Local: {
			'Retrieve a Patient (local)': async () => {
				const dbManager = new DatabaseManager();
				const response = await dbManager.retrievePatient('12345'); // Example patient ID
				if (response.error) {
					console.error('Error retrieving patient:', response.error);
				} else {
					console.log('Patient data:', response.data);
				}
			},
			'Create a Patient (local)': async () => {
				const dbManager = new DatabaseManager();
				dbManager.offre = 'local';
				let { data, error } = await db.insert('patients', patient);
				console.log('Insert response:', { data, error });
			},
			'Update a Patient (local)': async () => {
				// Logic for updating a patient
				console.log('Update a Patient (local) - Not implemented yet');
			},
			'Delete a Patient (local)': async () => {
				// Logic for deleting a patient
				console.log('Delete a Patient (local) - Not implemented yet');
			}
		}
	};

	function getRandomColor() {
		// Nice green color: rgb(48, 154, 133)
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += Math.floor(Math.random() * 16).toString(16);
		}
		return color;
	}
</script>

<a href="/dashboard" class="">Retour au dashboard</a>

<div class="flex flex-col space-y-10 px-2 pt-24">
	{#each Object.entries(tests) as [category, testSet]}
		<div>
			<h1 class="text-xl font-bold">{category}</h1>
			<div class="flex space-x-2">
				{#each Object.entries(testSet) as [label, onclick]}
					<button
						class="rounded px-4 py-2 text-white"
						style:background-color={getRandomColor()}
						{onclick}>
						{label}
					</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
