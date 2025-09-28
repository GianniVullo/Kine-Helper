<script>
	import { t } from '../../../../../../../lib/i18n';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import { pushState } from '$app/navigation';
	import { setContext } from 'svelte';

	let { data, children } = $props();

	let { patient, sp } = data;

	let accords = $state(sp.accords);
	setContext('accords', accords);

	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`;

	let tabs = $derived([
		{
			nom: 'Accords',
			href: homeUrl() + `/documents`,
			actif: homeUrl() + `/documents` === page.url.pathname
		},
		{
			nom: 'Renouvellements',
			href: homeUrl() + `/documents/renouvellements`,
			actif: homeUrl() + `/documents/renouvellements` === page.url.pathname
		},
		{
			nom: 'Testings',
			href: homeUrl() + `/documents/testings`,
			actif: homeUrl() + `/documents/testings` === page.url.pathname
		}
	]);
	const modals = {
		docSelection: () => {
			pushState('', {
				modal: {
					component: 'docSelection'
				}
			});
		},
		patientIncomplete: () => {
			pushState('', {
				modal: {
					title: 'Patient incomplet',
					description: `Kiné Helper a besoin que vous complétiez les champs suivant avant de continuer.<br /><ul class="mt-3 font-medium space-y-2">
					${patient.missing_fields.map((field) => `<li>- ${field}</li>`).join('')}
					</ul>`,
					href: `/dashboard/patients/${patient.patient_id}/update`,
					buttonTextConfirm: 'Compléter les informations du patient'
				}
			});
		}
	};
</script>

<SectionTitleWithTabs
	titre="Documents"
	className="space-x-2"
	{tabs}
	selectId="accords-tabs-select"
	tabsClassName="mb-0">
	{#snippet actions()}
		<BoutonPrincipalAvecIcone
			onclick={() => {
				if (!patient.is_complete) {
					modals.patientIncomplete();
				} else {
					modals.docSelection();
				}
			}}
			inner={$t('document.list', 'accord')}
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
