<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import { mutualites } from '../../../../stores/codeDetails';
	import Modal from '../../../libraries/overlays/Modal.svelte';
	import CheckboxGroup from '../../forms/fields/CheckboxGroup.svelte';
	import TwuiRadioGroupWithDescription from '../../forms/fields/TWUIRadioGroupWithDescription.svelte';
	import ComboBox from '../../ui/ComboBox.svelte';

	let patientList;
	let options = $state([]);
	$effect(() => {
		appState.db
			.select(
				'SELECT DISTINCT p.* FROM seances s JOIN patients p ON p.patient_id = s.patient_id WHERE s.has_been_attested = 0'
			)
			.then((res) => {
				patientList = res.data.map((patient) => ({
					label: patient.nom + ' ' + patient.prenom,
					value: patient.patient_id,
					src: patient.photo,
					placeholder: patient.nom.charAt(0).toUpperCase() + patient.prenom.charAt(0).toUpperCase()
				}));
				options = patientList;
			});
	});
	let showOptions = $state(false);
	const factureFilterOptions = [
		{
			label: 'Par mutuelle',
			description:
				'Choisissez les mutuelles pour lesquelles vous souhaitez créer des attestations.',
			value: 'mut'
		},
		{
			label: 'Sélectionner un patient',
			description: 'Créer des attestations uniquement pour le patient sélectionné.',
			value: 'patient'
		}
	];
	let selectedMut = $state([]);
	let selectedOption = $state('patient');
	$effect(() => {
		console.log('selectedMut', selectedMut);
	});
</script>

<Modal
	title="Créer sélectivement des attestations"
	body="Par mutualités ou pour un patient unique."
	opened={page.state.modal?.name == 'FacturePar'}>
	<div class="mt-5 mb-5 flex flex-col space-y-4">
		<TwuiRadioGroupWithDescription options={factureFilterOptions} bind:group={selectedOption} />

		{#if selectedOption == 'patient'}
			<ComboBox
				label="Uniquement pour"
				placeholder="Nom du patient"
				bind:showOptions
				{options}
				className={[showOptions && 'mb-56']}
				onItemClick={(option) => {
					console.log('clicked on ', option.value);
					goto(`/dashboard/finances/facturation-${option.value}`);
				}}
				oninput={(event) => {
					console.log('input');
					options = patientList.filter((option) => {
						return option.label.toLowerCase().includes(event.target.value.toLowerCase());
					});
				}} />
		{:else}
			{#await new Promise(async (resolve) => {
				const res = await appState.db.select('SELECT DISTINCT p.mutualite FROM seances s JOIN patients p ON p.patient_id = s.patient_id WHERE s.has_been_attested = 0');
				let filteredMut = Object.entries(mutualites).filter(([key, _]) => {
					return res.data.some((mut) => {
						return key == String(mut.mutualite).substring(0, 1) + '00';
					});
				});
				resolve(filteredMut);
			}) then filteredMut}
				<div class="flex flex-col">
					<h5 class="mb-4 block text-base/6 font-medium text-gray-900">Facturer par mutualité</h5>
					<CheckboxGroup
						label="Sélectionner les mutualités"
						bind:group={selectedMut}
						options={filteredMut.map(([id, mutuelle]) => ({
							id: id,
							name: mutuelle.name,
							label: mutuelle.name
						}))} />
				</div>
			{/await}

			<BoutonPrincipal
				className="mt-5"
				inner="Créer des attestations"
				onclick={() => {
					goto('/dashboard/finances/facturation-' + selectedMut.join(','));
				}} />
		{/if}
	</div>
</Modal>
