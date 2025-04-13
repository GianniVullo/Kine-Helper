<script>
	import StatsOverview from '../../../lib/cloud/components/pages/finances/StatsOverview.svelte';
	import BoutonPrincipal from '../../../lib/components/BoutonPrincipal.svelte';
	import BoutonPrincipalAvecIcone from '../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import BoutonSecondaireAvecIcone from '../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import SectionTitleWithTabs from '../../../lib/components/SectionTitleWithTabs.svelte';
	import { t } from '../../../lib/i18n';
	import { page } from '$app/state';
	import { pagePlusIcon } from '../../../lib/ui/svgs/IconSnippets.svelte';
	import { openModal } from '../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import Modal from '../../../lib/cloud/libraries/overlays/Modal.svelte';
	import FactureParModal from '../../../lib/cloud/components/pages/finances/FactureParModal.svelte';
	import { appState } from '../../../lib/managers/AppState.svelte';
	import { goto } from '$app/navigation';
	import Spiner from '../../../lib/cloud/components/layout/Spiner.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const homeUrl = () => `/dashboard/patients/situation-pathologique/`;

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
	async function getTotal() {
		let { data: total, error } = await appState.db.select(
			'SELECT COUNT(*) as total FROM seances s WHERE s.user_id = $1 AND s.has_been_attested = 0',
			[appState.user.id]
		);
		if (total) {
			total = total[0].total;
		} else {
			total = 0;
		}
		if (error) {
			console.error('Error fetching total:', error);
			reject(error);
			return;
		}
		return total;
	}
</script>

<!-- Modals -->
<FactureParModal />
<Modal
	opened={page.state.modal?.name === 'noFacture'}
	title="Aucunes séances à facturer"
	body="Vous êtes en ordre! Vous pouvez fixer de nouveaux rendez-vous à facturer."
	buttonTextCancel="none"
	buttonTextConfirm="Ok" />

<Modal
	opened={page.state.modal?.name === 'buildingFactures'}
	title="Vos factures sont en cours de construction"
	body="Vous serez redirigé lorsque la construction sera terminée.">
	<div class="my-10 flex items-center justify-center">
		<Spiner width="size-14" thickness="border-4" />
		<p class="ml-5">Opération en cours...</p>
	</div>
</Modal>

<div class="md:flex md:items-center md:justify-between">
	<div class="min-w-0 flex-1">
		<h2 class="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
			Finances
		</h2>
	</div>
	<div class="mt-4 flex md:mt-0 md:ml-4">
		<!-- <button
			type="button"
			class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
			>Edit</button> -->
		<BoutonPrincipal
			className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			href="/dashboard/finances/tarifs-form"
			inner="Gérer vos tarifs et suppléments" />
	</div>
</div>

<!-- <p class="mt-10">
	Bienvenue dans la page tarifs qui permet aux kinés déconventionnés de définir des tarifs
	personnalisés et aux kinés connventionné de définir des suppléments en cas de demandes horaires
	spéciales du patient (après 19h ou avant 7h).
</p>
 -->

<StatsOverview />

<SectionTitleWithTabs className="mt-5" titre={$t('form.generateur', 'tarification.title')} {tabs}>
	{#snippet actions()}
		<div class="flex space-x-2">
			<BoutonSecondaireAvecIcone
				onclick={async () => {
					console.log('open modal');

					if ((await getTotal()) > 0) {
						openModal({ name: 'FacturePar' });
					} else {
						openModal({ name: 'noFacture' });
					}
				}}
				icon={pagePlusIcon}
				inner="Facturer par [•••]" />
			<BoutonPrincipalAvecIcone
				onclick={async () => {
					if ((await getTotal()) > 0) {
						openModal({ name: 'buildingFactures' });
						goto('/dashboard/finances/facturation-all');
					} else {
						openModal({ name: 'noFacture' });
					}
				}}
				icon={pagePlusIcon}
				inner="Facturer tout" />
		</div>
	{/snippet}
</SectionTitleWithTabs>

Facture par tiers-payant facture Par Mutuelle facture Pour patient
