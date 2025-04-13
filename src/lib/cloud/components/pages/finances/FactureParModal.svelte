<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BoutonPrincipal from '../../../../components/BoutonPrincipal.svelte';
	import { appState } from '../../../../managers/AppState.svelte';
	import Modal from '../../../libraries/overlays/Modal.svelte';
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
			label: 'Tiers-payant',
			description:
				'Créer des attestations pour tous les patients tiers-payants qui ont encore des séances non-attestées.',
			value: 'tp'
		},
		{
			label: 'Non tiers-payant',
			description:
				'Créer des attestations pour tous les patients non tiers-payants qui ont encore des séances non-attestées.',
			value: 'ntp'
		},
		{
			label: 'Sélectionner un patient',
			description: 'Créer des attestations uniquement pour le patient sélectionné.',
			value: 'patient'
		}
	];
	let selectedOption = $state('patient');
</script>

<Modal title="Créer sélectivement des attestations" opened={page.state.modal?.name == 'FacturePar'}>
	<div class="mt-10 mb-5 flex flex-col space-y-4">
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
			<BoutonPrincipal
				className="mt-5"
				inner="Créer des attestations"
				onclick={() => {
					goto('/dashboard/finances/facturation-' + selectedOption);
				}} />
		{/if}
	</div>
</Modal>
