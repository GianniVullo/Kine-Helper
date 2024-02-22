<script>
	import { ListBox, ListBoxItem, getModalStore } from '@skeletonlabs/skeleton';
	import { NomenclatureManager } from '../utils/nomenclatureManager';
	import CheckboxFieldV2 from '../forms/abstract-fields/CheckboxFieldV2.svelte';
	import dayjs from 'dayjs';
	import { derived, writable } from 'svelte/store';

	const modalStore = getModalStore();
	// <!--*--> IDÉE GÉNÉRALE
	// Ici nous demandons simplement à l'utilisateur si il souhaite imprimer des factures en plus de ses attestations.
	// Les factures doivent être enregistrées dans les documents du patients avec le type "facture".
	// <!--*--> ÉTAPE 1 : savoir si le patient est tiers-payant ou non
	// Si le patient est tiers-payant, il ne faut pas lui demander s'il veut imprimer des factures mutuelles
	let tiersPayant = $modalStore[0].meta.patient.tiers_payant;

	// <!--*--> ÉTAPE 2 : Générer des champs de formulaire facturation booléens
	let factureMutuelle = tiersPayant ? true : false;
	let facturePatient = !tiersPayant ? true : false;
	let with_details = true;

	// <!--*--> ÉTAPE 3 : collecte des réponses et redirection vers la page patient
	function onFormSubmit() {
		if ($modalStore[0].response)
			$modalStore[0].response({
				factureMutuelle,
				facturePatient,
				with_details: facturePatient ? with_details : false
			});
		modalStore.close();
	}

	// Props
	/** Exposes parent props to this component. */
	export let parent;

	// Base Classes
	const cBase =
		'card p-4 w-modal shadow-xl space-y-4 border border-surface-500 dark:border-surface-300';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Factures</header>
		<article>Souhaitez-vous produire des factures pour ce(s) attestation(s) ?</article>

		<div class="flex flex-col space-y-4">
			{#if tiersPayant}
				<CheckboxFieldV2
					name="factureMutuelle"
					label="Créer et imprimer une facture mutuelle"
					bind:value={factureMutuelle} />
			{/if}
			<div class="flex flex-col justify-start space-y-2">
				<CheckboxFieldV2
					name="facturePatient"
					label="Créer et imprimer une facture pour le patient"
					bind:value={facturePatient} />
				<CheckboxFieldV2
					name="with_details"
					class="ml-2"
					label="Ajouter le détail des prestations sur la facture du patient"
					bind:value={with_details} />
			</div>
		</div>

		<footer class="modal-footer {parent.regionFooter}">
			<button class="variant-filled-primary btn" on:click={onFormSubmit}>poursuivre</button>
		</footer>
	</div>
{/if}
