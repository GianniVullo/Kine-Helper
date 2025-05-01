<script>
	import { PlusIcon, PrinterIcon, UpdateIcon, DeleteIcon } from '$lib/ui/svgs/index';
	import { page } from '$app/state';
	import dayjs from 'dayjs';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import { printAttestation } from '../../../../../../../lib/utils/rawPrinting';
	import { fetchCodeDesSeances } from '../../../../../../../lib/utils/nomenclatureManager';
	import FactureBox from '../../../../../../../lib/ui/FactureBox.svelte';
	import { t } from '../../../../../../../lib/i18n';
	import CardTable from '../../../../../../../lib/components/CardTable.svelte';
	import Dropdown from '../../../../../../../lib/components/dropdowns/Dropdown.svelte';
	import {
		dividerDropper,
		dropdownItemWithIcon
	} from '../../../../../../../lib/components/dropdowns/DropdownSnippets.svelte';
	import {
		buildingIcon,
		buildingIconWithCheck,
		buildingIconWithCross,
		editIcon,
		printerIcon,
		userIcon,
		userIconWithCheck,
		userIconWithCross
	} from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { iconBadge } from '../../../../../../../lib/components/snippets/BadgesSnippets.svelte';
	import {
		markAsPaid,
		updateAttestation
	} from '../../../../../../../lib/user-ops-handlers/attestations';
	import Modal from '../../../../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { pushState } from '$app/navigation';
	import { cloneDeep } from 'lodash';

	let { data } = $props();
	let { patient, sp } = data;
	function prescription(prescriptionId) {
		return sp.prescriptions.find((prescription) => prescription.prescription_id === prescriptionId);
	}

	const attestations = $state(sp.attestations);

	const printHandler = async (attestation) => {
		console.log(attestation);
		pushState('', {
			...page.state,
			modal: { name: 'printAttestation', attestation: cloneDeep($state.snapshot(attestation)) }
		});
	};

	const updatePaidStatuses = async (attestation, key) => {
		await markAsPaid($state.snapshot(attestation), key);
		attestation[`${key}_paid`] = !attestation[`${key}_paid`];
	};

	let menuItemsList = $state([
		...(patient.tiers_payant
			? [
					{
						onclick: (attestation) => async () => {
							await updatePaidStatuses(attestation, 'mutuelle');
						},
						icon: ({ mutuelle_paid }) =>
							mutuelle_paid ? buildingIconWithCheck : buildingIconWithCross,
						inner: ({ mutuelle_paid }) => (mutuelle_paid ? 'Impayé' : 'Payé')
					}
				]
			: []),
		...(patient.ticket_moderateur
			? [
					{
						onclick: (attestation) => async () => {
							await updatePaidStatuses(attestation, 'patient');
						},
						icon: ({ patient_paid }) => (patient_paid ? userIconWithCheck : userIconWithCross),
						inner: ({ patient_paid }) => (patient_paid ? 'Impayé' : 'Payé')
					}
				]
			: []),
		{
			onclick: (attestation) => async () => {
				await printHandler(attestation);
			},
			icon: (_) => printerIcon,
			inner: (_) => 'Imprimer'
		}
		// {
		// 	href: (attestation) =>
		// 		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/${attestation.attestation_id}/update`,
		// 	icon: (_) => editIcon,
		// 	inner: (_) => 'Modifier'
		// }
		/**
		 * TODO
		 * Suppression : Supprimer les séances liées ou bien les remettres dans le calendrier comme si elle n'avaient jamais été attestée ? je n'avais jamais pu faire ça parce qu'à l'époque de la création de cette page il n'y avait pas encore de handler pour la gestion de l'ajout, réorganisation et même suppression de séances
		 * TODO
		 * Modifier : Modifier les informations de l'attestation
		 * {
		 * 	onclick: () => {},
		 * 	icon: (attestation) => deleteIcon,
		 * 	inner: (_) => 'Supprimer'
		 * }
		 */
	]);
</script>

<!-- TODO Devrais-je rajouter que l'attestation porte la prescription ?  -->

<Modal
	opened={page.state?.modal?.name === 'printAttestation'}
	title={$t('attestation.detail', 'printModal.title')}
	body={$t('attestation.detail', 'printModal.body', {
		date: dayjs(page.state.modal.attestation.date).format('DD/MM/YYYY')
	})}
	buttonTextConfirm={$t('attestation.detail', 'printModal.confirm')}
	buttonTextCancel={$t('shared', 'cancel')}
	onAccepted={async () => {
		console.log(page.state.modal.attestation);
		const { error } = await printAttestation(null, page.state.modal.attestation);
		if (error) {
			console.log(error);
		}
		history.back();
	}} />

{#if sp.attestations.length > 0}
	<!--* ATTESTATIONS LIST -->
	<CardTable>
		{#snippet header()}
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
				>Total</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
				>Part personnelle</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
				>Paiement</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
			<!-- TODO Ici j'ai mis action parce que, en fait, il va falloir mettre Modifier, Supprimer, Imprimer, Marquer comme payée par la mutuelle, par le patient, et qui sait quoi d'autres encore -->
		{/snippet}
		{#snippet body()}
			{#each attestations as attestation}
				<tr>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
						{dayjs(attestation.date).format('DD/MM/YYYY')}
					</td>
					<td class="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
						<div class="flex items-center">
							<div class="ml-4">
								<div class="font-medium text-gray-900">{patient.nom} {patient.prenom}</div>
								{#if attestation.porte_prescr}
									<div class="mt-1 text-gray-500">
										{$t('attestation.detail', 'porte_prescr')}
									</div>
								{/if}
							</div>
						</div>
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
						<div class="text-gray-900">{patient.adresse}</div>
						<div class="mt-1 text-gray-500">{patient.cp} {patient.localite}</div>
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500">
						{#if patient.tiers_payant}
							<div class="text-gray-900">
								{@render iconBadge(
									`mutuelle ${attestation.mutuelle_paid ? 'a' : "n'a pas"} payé!`,
									buildingIcon,
									attestation.mutuelle_paid ? 'green' : 'red'
								)}
							</div>
						{/if}
						{#if patient.ticket_moderateur}
							<div class="mt-1 text-gray-500">
								{@render iconBadge(
									`${attestation.patient_paid ? '' : 'im'}payé!`,
									userIcon,
									attestation.patient_paid ? 'green' : 'red'
								)}
							</div>
						{/if}
					</td>
					<td
						class="relative py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0">
						<Dropdown inner="actions" className="" id={attestation.attestation_id}>
							{#snippet dropper(menuItems, menuState)}
								<div
									id={attestation.attestation_id}
									style="width: max-content;"
									class="fixed z-10 mt-2 origin-bottom-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition duration-200 focus:outline-none {menuState
										? 'scale-100 opacity-100 ease-out'
										: 'pointer-events-none scale-95 opacity-0 ease-in'}"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="mobile-menu-button"
									tabindex="-1">
									<!-- Active: "bg-gray-100 outline-none", Not Active: "" -->
									{#each menuItemsList as { href, onclick, inner, icon }}
										{@render dropdownItemWithIcon(
											href ? href(attestation) : undefined,
											onclick ? onclick(attestation) : undefined,
											inner(attestation),
											icon(attestation)
										)}
									{/each}
								</div>
							{/snippet}
						</Dropdown>
					</td>
				</tr>
			{/each}
		{/snippet}
	</CardTable>
{:else}
	<p>{$t('attestation.list', 'empty')}</p>
{/if}
