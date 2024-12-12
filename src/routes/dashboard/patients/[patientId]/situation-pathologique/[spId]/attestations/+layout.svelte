<script>
	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	import { t } from '../../../../../../../lib/i18n';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import BoutonSecondaireAvecIcone from '../../../../../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { patients } from '../../../../../../../lib/stores/PatientStore';
	import { page } from '$app/stores';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';

	const modalStore = getModalStore();
	let patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);

	let { children } = $props();
	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`;
	let tabs = [
		{
			nom: 'Attestations',
			href: homeUrl() + `/attestations`,
			actif: $page.url.pathname === homeUrl() + `/attestations`
		},
		{
			nom: 'Factures',
			href: homeUrl() + `/attestations/factures`,
			actif: $page.url.pathname === homeUrl() + `/attestations/factures`
		}
	];
</script>

<SectionTitleWithTabs
	titre={$t('form.generateur', 'tarification.title')}
	className="space-x-2"
	{tabs}>
	{#snippet actions()}
		<BoutonSecondaireAvecIcone
			onclick={() => modalStore.trigger(documentSelectionModal)}
			className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
			inner={$t('attestation.detail', 'bill')}
			icon={addIcon} />
		<BoutonPrincipalAvecIcone
			href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create`}
			className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			inner="Attestation"
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
