<script>
	import { t } from '../../../../../../../lib/i18n';
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import BoutonSecondaireAvecIcone from '../../../../../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import { goto } from '$app/navigation';
	import { setContext } from 'svelte';
	import FactureCreationModal from '$lib/ui/FactureCreationModal.svelte';

	let { data, children } = $props();

	let { patient, sp } = data;

	let factures = $state(sp.factures);
	console.log('factures In layuot', factures);
	setContext('factures', factures);

	const documentSelectionModal = {
		type: 'component',
		component: FactureCreationModal,
		meta: { sp, patient, factures }
	};

	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`;

	let tabs = $derived([
		{
			nom: 'Attestations',
			href: homeUrl() + `/attestations`,
			actif: page.url.pathname === homeUrl() + `/attestations`
		},
		{
			nom: 'Factures',
			href: homeUrl() + `/attestations/factures`,
			actif: page.url.pathname === homeUrl() + `/attestations/factures`
		}
	]);
</script>

<SectionTitleWithTabs
	titre={$t('form.generateur', 'tarification.title')}
	className="space-x-2"
	{tabs}>
	{#snippet actions()}
	{#snippet factureCreationModal()}
		<FactureCreationModal />
	{/snippet}
		<BoutonSecondaireAvecIcone
			size="sm"
			onclick={() => {
				if (sp.attestations.length > 0) {
					modalStore.component = factureCreationModal;
					modalStore.trigger({...documentSelectionModal, component: factureCreationModal});
				} else {
					modalStore.trigger({
						title: 'Pas d\'attestations',
						body: 'Veuillez créer une attestation avant de continuer.',
						buttonTextConfirm: 'Ok',
						response: (r) => {
							if (r) {
								goto(
									`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create`
								);
							}
						},
						type: 'alert'
					});
				}
			}}
			inner={$t('attestation.detail', 'bill')}
			icon={addIcon} />
		<BoutonPrincipalAvecIcone
			onclick={() => {
				let modal = {
					type: 'confirm',
					buttonTextCancel: 'annuler'
				};
				if (!patient.is_complete) {
					modalStore.trigger({
						title: 'Patient incomplet',
						body: 'Veuillez compléter les informations du patient avant de continuer.',
						buttonTextConfirm: 'Compléter les informations du patient',
						response: (r) => {
							if (r) {
								goto(`/dashboard/patients/${patient.patient_id}/update`);
							}
						},
						...modal
					});
				} else if (sp.prescriptions.length === 0) {
					modalStore.trigger({
						title: 'Pas de prescription',
						body: 'Veuillez ajouter une prescription avant de continuer.',
						buttonTextConfirm: 'Ajouter une prescription',
						response: (r) => {
							if (r) {
								goto(
									`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`
								);
							}
						},
						...modal
					});
					
				} else if (sp.seances.filter((seance) => !seance.has_been_attested).length === 0) {
					modalStore.trigger({
						buttonTextConfirm: 'Créer une nouvelle séance',
						title: "Il n'y a pas de séance à attester",
						body: 'Voulez-vous créer une nouvelle séance ?',
						response: (r) => {
							if (r) {
								goto(
									`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create`
								);
							}
						},
						...modal
					});
				} else {
					goto(
						`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create`
					);
				}
			}}
			size="sm"
			className="ml-3 inline-flex items-center bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			inner="Attestation"
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
