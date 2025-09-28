<script>
	import { page } from '$app/state';
	import dayjs from 'dayjs';
	import { printAttestation } from '../../../../../../../lib/utils/rawPrinting';
	import { t } from '../../../../../../../lib/i18n';
	import CardTable from '../../../../../../../lib/components/CardTable.svelte';
	import {
		buildingIcon,
		buildingIconWithCheck,
		buildingIconWithCross,
		printerIcon,
		userIcon,
		userIconWithCheck,
		userIconWithCross
	} from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { iconBadge } from '../../../../../../../lib/components/snippets/BadgesSnippets.svelte';
	import { markAsPaid } from '../../../../../../../lib/user-ops-handlers/attestations';
	import { pushState } from '$app/navigation';
	import { cloneDeep } from 'lodash';
	import TwDropdown from '../../../../../../../lib/components/TWElements/TWDropdown.svelte';
	import { isMobile } from '../../../../../../../lib/utils/platformwhoami';
	import { onDestroy, onMount } from 'svelte';
	import { on } from 'svelte/events';

	let { data } = $props();
	let { patient, sp } = data;

	let printEventHandler;

	const attestations = $state(sp.attestations);

	const printHandler = async (attestation) => {
		pushState('', {
			...page.state,
			modal: {
				action: 'signalConfirmation',
				title: $t('attestation.detail', 'printModal.title'),
				description: $t('attestation.detail', 'printModal.body', {
					date: dayjs(attestation.date).format('DD/MM/YYYY')
				}),
				buttonTextConfirm: $t('attestation.detail', 'printModal.confirm'),
				buttonTextCancel: $t('shared', 'cancel'),
				attestation: cloneDeep($state.snapshot(attestation))
			}
		});
	};

	const updatePaidStatuses = async (attestation, key) => {
		await markAsPaid($state.snapshot(attestation), key);
		attestation[`${key}_paid`] = !attestation[`${key}_paid`];
	};

	const menuItemsList = (attestation) => [
		...(patient.tiers_payant
			? [
					{
						onclick: async () => {
							await updatePaidStatuses(attestation, 'mutuelle');
						},
						icon: attestation.mutuelle_paid ? buildingIconWithCheck : buildingIconWithCross,
						label: attestation.mutuelle_paid ? 'Impayé' : 'Payé'
					}
				]
			: []),
		...(patient.ticket_moderateur
			? [
					{
						onclick: async () => {
							await updatePaidStatuses(attestation, 'patient');
						},
						icon: attestation.patient_paid ? userIconWithCheck : userIconWithCross,
						label: attestation.patient_paid ? 'Impayé' : 'Payé'
					}
				]
			: [])
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
	];
	$effect(() => {
		let motive = page.url.searchParams.get('motive');
		if (motive === 'no_seance_found') {
			console.log('motive is no seance found');
			setTimeout(() => {
				pushState('', {
					modal: {
						title: 'Aucunes séances à traiter',
						description:
							'Si vous souhaitez attester des séances que vous n\'avez pas encore effectuées, veuillez utiliser l\'option "Tarifer jusqu\'ici" de l\'onglet "séances"'
					}
				});
			}, 400);
		}
	});
	onMount(() => {
		printEventHandler = on(window, 'Dialog:Confirmed', async (e) => {
			e.detail.attestation.total_recu = `${e.detail.attestation.total_recu}`;
			const { error } = await printAttestation(null, e.detail.attestation);
			if (error) {
				console.warn('Error while printing Attestation', error);
			}
		});
	});
	onDestroy(() => {
		printEventHandler();
	});
</script>

{#if sp.attestations.length > 0}
	<!--* ATTESTATIONS LIST -->
	<CardTable>
		<!-- TODO Devrais-je rajouter que l'attestation porte la prescription ?  -->
		{#snippet header()}
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Date</th>
			<th scope="col" class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-0">Total</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Part personnelle</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">Paiement</th>
			<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
				><span class="sr-only">Statut</span></th>
			{#if !isMobile()}
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold"
					><span class="sr-only">Imprimer</span></th>
			{/if}
			<!-- TODO Ici j'ai mis action parce que, en fait, il va falloir mettre Modifier, Supprimer, Imprimer, Marquer comme payée par la mutuelle, par le patient, et qui sait quoi d'autres encore -->
		{/snippet}
		{#snippet body()}
			{#each attestations as attestation}
				<tr>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
						{dayjs(attestation.date).format('DD/MM/YYYY')}
					</td>
					<td class="py-5 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-0">
						<div>{attestation.valeur_totale}€</div>
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
						<div class="">{attestation.total_recu}€</div>
					</td>
					<td class="px-3 py-5 text-sm whitespace-nowrap text-gray-500 dark:text-gray-300">
						{#if patient.tiers_payant}
							<div class="">
								{@render iconBadge(
									`mutuelle ${attestation.mutuelle_paid ? 'a' : "n'a pas"} payé!`,
									buildingIcon,
									attestation.mutuelle_paid ? 'green' : 'red'
								)}
							</div>
						{/if}
						{#if patient.ticket_moderateur}
							<div class="mt-1 text-gray-500 dark:text-gray-300">
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
						<TwDropdown triggerText="Statut" items={[menuItemsList(attestation)]} />
					</td>
					{#if !isMobile()}
						<td
							class="relative py-5 pr-4 pl-3 text-left text-sm font-medium whitespace-nowrap sm:pr-0">
							<button
								class="group flex space-x-1"
								onclick={async () => {
									await printHandler(attestation);
								}}>
								{@render printerIcon(
									'size-5 text-indigo-500 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-500'
								)}
								<p
									class="text-indigo-500 group-hover:text-indigo-700 dark:text-indigo-400 dark:group-hover:text-indigo-500">
									Imprimer
								</p>
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		{/snippet}
	</CardTable>
{:else}
	<p>{$t('attestation.list', 'empty')}</p>
{/if}
