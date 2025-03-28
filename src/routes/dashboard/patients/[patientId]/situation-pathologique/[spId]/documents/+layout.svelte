<script>
	import { t } from '../../../../../../../lib/i18n';
	import { modalStore } from '$lib/cloud/libraries/overlays/modalUtilities.svelte';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import { goto } from '$app/navigation';
	import { setContext } from 'svelte';

	let { data, children } = $props();

	let { patient, sp } = data;

	let accords = $state(sp.accords);
	console.log('accords In layuot', accords);
	setContext('accords', accords);

	const documentSelectionModal = {
		type: 'component',
		component: 'documentSelection',
		meta: { accords }
	};

	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`;

	let tabs = $derived([
		{
			nom: 'Accords',
			href: homeUrl() + `/documents`,
			actif: page.url.pathname === homeUrl() + `/documents`
		},
		{
			nom: 'Renouvellements',
			href: homeUrl() + `/documents/renouvellements`,
			actif: page.url.pathname === homeUrl() + `/documents/renouvellements`
		},
		{
			nom: 'Testings',
			href: homeUrl() + `/documents/testings`,
			actif: page.url.pathname === homeUrl() + `/documents/testings`
		}
	]);
</script>

<SectionTitleWithTabs titre="Documents" className="space-x-2" {tabs}>
	{#snippet actions()}
		<BoutonPrincipalAvecIcone
			size="sm"
			onclick={() => {
				if (!patient.is_complete) {
					modalStore.trigger({
						type: 'confirm',
						title: 'Patient incomplet',
						body: 'Veuillez compléter les informations du patient avant de continuer.',
						buttonTextConfirm: 'Compléter les informations du patient',
						response: (r) => {
							if (r) {
								goto(`/dashboard/patients/${patient.patient_id}/update`);
							}
						}
					});
				} else {
					modalStore.trigger(documentSelectionModal);
				}
			}}
			inner={$t('document.list', 'accord')}
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
