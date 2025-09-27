<script>
	import StatsOverview from '../../../lib/cloud/components/pages/finances/StatsOverview.svelte';
	import BoutonPrincipal from '../../../lib/components/BoutonPrincipal.svelte';
	// import BoutonPrincipalAvecIcone from '../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	// import BoutonSecondaireAvecIcone from '../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	// import SectionTitleWithTabs from '../../../lib/components/SectionTitleWithTabs.svelte';
	import { t } from '../../../lib/i18n';
	import { page } from '$app/state';
	// import { pagePlusIcon } from '../../../lib/ui/svgs/IconSnippets.svelte';
	// import FactureParModal from '../../../lib/cloud/components/pages/finances/FactureParModal.svelte';
	import { appState } from '../../../lib/managers/AppState.svelte';
	// import { goto } from '$app/navigation';
	import Spiner from '../../../lib/cloud/components/layout/Spiner.svelte';
	import PageTitle from '../../../lib/cloud/components/layout/PageTitle.svelte';
	import { pushState } from '$app/navigation';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const homeUrl = () => `/dashboard/patients/situation-pathologique/`;

	let tabs = $derived([
		{
			nom: $t('finances', 'tabs.attestations', {}, 'Attestations'),
			href: homeUrl() + `/attestations`,
			actif: page.url.pathname === homeUrl() + `/attestations`
		},
		{
			nom: $t('finances', 'tabs.invoices', {}, 'Invoices'),
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
	const modals = {
		noFacture() {
			pushState('', {
				modal: {
					title: $t('finances', 'modals.noSessions.title', {}, 'No sessions to bill'),
					body: $t(
						'finances',
						'modals.noSessions.body',
						{},
						'You are up to date! You can schedule new appointments to bill.'
					),
					buttonTextCancel: 'none',
					buttonTextConfirm: $t('finances', 'buttons.ok', {}, 'Ok')
				}
			});
		}
	};
</script>

<!-- Modals -->
<!-- <FactureParModal /> -->

<!-- 
! adapter ça avec le nouveau Dialog
<Modal
	opened={page.state.modal?.name === 'buildingFactures'}
	title={$t('finances', 'modals.buildingInvoices.title', {}, 'Your invoices are being built')}
	body={$t(
		'finances',
		'modals.buildingInvoices.body',
		{},
		'You will be redirected when the construction is complete.'
	)}>
	<div class="my-10 flex items-center justify-center">
		<Spiner width="size-14" thickness="border-4" />
		<p class="ml-5">
			{$t('finances', 'modals.buildingInvoices.operation', {}, 'Operation in progress...')}
		</p>
	</div>
</Modal> -->
<PageTitle titre={$t('finances', 'title', {}, 'Finances')}>
	<div class="mt-4 flex md:mt-0 md:ml-4">
		<!-- <button
			type="button"
			class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
			>Edit</button> -->
		<BoutonPrincipal
			className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			href="/dashboard/finances/tarifs-form"
			inner={$t('finances', 'manageTariffs', {}, 'Manage your rates and supplements')} />
	</div>
</PageTitle>

<!-- <p class="mt-10">
	Bienvenue dans la page tarifs qui permet aux kinés déconventionnés de définir des tarifs
	personnalisés et aux kinés connventionné de définir des suppléments en cas de demandes horaires
	spéciales du patient (après 19h ou avant 7h).
</p>
 -->

<StatsOverview />

<!-- <SectionTitleWithTabs className="mt-5" titre={$t('form.generateur', 'tarification.title')} {tabs}>
	{#snippet actions()}
		<div class="flex space-x-2">
			<BoutonSecondaireAvecIcone
				onclick={async () => {
					console.log('open modal');

					if ((await getTotal()) > 0) {
						openModal({ name: 'FacturePar' });
					} else {
						modals.noFacture();
					}
				}}
				icon={pagePlusIcon}
				inner={$t('finances', 'buttons.billBy', {}, 'Bill by [•••]')} />
			<BoutonPrincipalAvecIcone
				onclick={async () => {
					if ((await getTotal()) > 0) {
						openModal({ name: 'buildingFactures' });
						goto('/dashboard/finances/facturation-all');
					} else {
						modals.noFacture();
					}
				}}
				icon={pagePlusIcon}
				inner={$t('finances', 'buttons.billAll', {}, 'Bill all')} />
		</div>
	{/snippet}
</SectionTitleWithTabs>
 -->

<p class="my-5">
	{$t(
		'finances',
		'underConstruction',
		{},
		'Under construction: coming soon, a generator for attestations and invoices by insurance company'
	)}
</p>
