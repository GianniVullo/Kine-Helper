<script>
	import { groupBy } from 'lodash';
	import SectionTitleWithTabs from '../../../../lib/components/SectionTitleWithTabs.svelte';
	import { page } from '$app/state';
	import PatientSideNavigation from '../../../../lib/cloud/components/pages/finances/PatientSideNavigation.svelte';
	import { untrack } from 'svelte';
	import { appState } from '../../../../lib/managers/AppState.svelte';
	import TableWithCheckbox from '../../../../lib/components/TableWithCheckbox.svelte';
	import { openModal } from '../../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import { cloneDeep } from 'lodash';
	import dayjs from 'dayjs';
	import Modal from '../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import AttestationPreview from '../../../../lib/components/forms/fields/AttestationPreview.svelte';
	import Field from '../../../../lib/components/forms/blocks/Field.svelte';
	import { mutualites } from '../../../../lib/stores/codeDetails';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const attestationsParMutualite = groupBy(data.patients, (pA) => {
		let stuff = mutualites[String(pA.patient.mutualite).substring(0, 1) + '00'].name;
		console.log('stuff', stuff);
		return stuff;
	});

	let selectedKey = $state(Object.keys(attestationsParMutualite)[0]);
	let dataDisplayed = $derived(attestationsParMutualite[selectedKey]);

	let patientSelected = $state();
	let initialNumeor = $state();
	let attestationToPrint = $state(
		Object.fromEntries(
			new Map(
				data.patients
					.map((p) => p.attestations)
					.map((attestation) => {
						let vals = Object.values(attestation);
						console.log('vals', vals);
						return vals;
					})
					.flat(Infinity)
					.map((attestation) => {
						console.log('attestation', attestation);
						return [attestation.attestation_id, true];
					})
			)
		)
	);
	console.log('attestationToPrint', attestationToPrint);
	$effect(() => {
		selectedKey;
		untrack(() => {
			patientSelected = attestationsParMutualite[selectedKey][0];
		});
	});
</script>

<Modal
	className="max-w-3xl"
	opened={page.state.modal?.name === 'detail'}
	title="Détails de l'attestations">
	<div class="flex max-h-96 w-full flex-col overflow-y-scroll px-5">
		<AttestationPreview lines={page.state?.modal?.lines} />
	</div>
	<button
		onclick={() => {
			history.back();
		}}
		class="mt-5 w-full rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
		Fermer
	</button>
</Modal>

<SectionTitleWithTabs
	tabs={Object.keys(attestationsParMutualite).map((key) => ({
		onclick() {
			console.log('key', 'clicked');
			selectedKey = key;
		},
		nom: key,
		actif: selectedKey === key
	}))}
	className="mb-5"
	titre="Attestations"
	soustitre="Décochez une attestation pour ne pas l'imprimer ainsi que ses factures associées.">
	{#snippet actions()}{/snippet}
</SectionTitleWithTabs>

{#await new Promise(async (resolve) => {
	const numero = await appState.db.getItem('num_attestation');
	initialNumeor = numero;
	resolve();
}) then _}
	<Field
		field={{
			id: 'numero',
			name: 'numero',
			titre: 'Numéro de la première attestation',
			inputType: 'number',
			removeArrows: true,
			outerCSS: 'mt-8 mb-10'
		}}
		bind:value={initialNumeor} />
{/await}
<div class="grid grid-cols-6">
	<div class="col-span-1">
		<PatientSideNavigation
			selectedPatient={patientSelected}
			patients={dataDisplayed}
			onPatientClick={(patient) => {
				console.log('patient', patient);
				patientSelected = patient;
			}} />
	</div>
	<div class="col-span-5 flex flex-col space-y-10">
		{#each Object.keys(patientSelected?.attestations ?? {}) as sp_id}
			{#await new Promise(async (resolve) => {
				resolve((await appState.db.select( 'SELECT motif FROM situations_pathologiques WHERE sp_id = $1', [sp_id] )).data[0].motif);
			}) then titre}
				<TableWithCheckbox
					{titre}
					description="Toutes les attestations sur le point d'être créée pour cette situation pathologique">
					{#snippet header()}
						<th scope="col" class="relative px-7 sm:w-12 sm:px-6">
							<div class="group absolute top-1/2 left-4 -mt-2 grid size-4 grid-cols-1">
								<input
									type="checkbox"
									checked={patientSelected.attestations[sp_id]
										.map((attestation) => attestationToPrint[attestation.attestation_id])
										.some(Boolean)}
									onchange={(e) => {
										console.log('e', e.target.checked);
										if (!e.target.checked) {
											for (const attest of patientSelected.attestations[sp_id]) {
												attestationToPrint[attest.attestation_id] = false;
											}
										}
										if (e.target.checked) {
											for (const attest of patientSelected.attestations[sp_id]) {
												attestationToPrint[attest.attestation_id] = true;
											}
										}
									}}
									class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto" />
								<svg
									class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
									viewBox="0 0 14 14"
									fill="none">
									<path
										class="opacity-0 group-has-checked:opacity-100"
										d="M3 8L6 11L11 3.5"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round" />
									<path
										class="opacity-0 group-has-indeterminate:opacity-100"
										d="M3 7H11"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round" />
								</svg>
							</div>
						</th>

						<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
							>Date</th>
						<th
							scope="col"
							class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
							>Total</th>
						<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
							>Part personnelle</th>
						<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
							><span class="sr-only">Détails</span></th>
					{/snippet}
					{#snippet body()}
						{#each patientSelected.attestations[sp_id] as attestation}
							<tr>
								<td class="relative px-7 sm:w-12 sm:px-6">
									<!-- Selected row marker, only show when row is selected. -->
									<!-- <div class="absolute inset-y-0 left-0 w-0.5 bg-indigo-600"></div> -->
									<div class="group absolute top-1/2 left-4 -mt-2 grid size-4 grid-cols-1">
										<input
											type="checkbox"
											bind:checked={attestationToPrint[attestation.attestation_id]}
											class="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto" />
										<svg
											class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
											viewBox="0 0 14 14"
											fill="none">
											<path
												class="opacity-0 group-has-checked:opacity-100"
												d="M3 8L6 11L11 3.5"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round" />
											<path
												class="opacity-0 group-has-indeterminate:opacity-100"
												d="M3 7H11"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
									</div>
								</td>

								<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
									{dayjs(attestation.date).format('DD/MM/YYYY')}
								</td>
								<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
									{attestation.valeur_totale.toFixed(2)} €
								</td>
								<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
									{attestation.total_recu.toFixed(2)} €
								</td>
								<td class="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-3">
									<button
										onclick={() => {
											console.log('attestation', attestation);
											openModal({ name: 'detail', lines: cloneDeep(attestation.lines) });
										}}
										class="text-indigo-600 hover:text-indigo-900">Détails</button>
								</td>
							</tr>
						{/each}
					{/snippet}
				</TableWithCheckbox>
			{/await}
		{/each}
	</div>
</div>
