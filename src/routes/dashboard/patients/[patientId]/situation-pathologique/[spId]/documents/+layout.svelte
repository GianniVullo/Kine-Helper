<script>
	import { t } from '../../../../../../../lib/i18n';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import { goto } from '$app/navigation';
	import { setContext } from 'svelte';
	import Modal from '../../../../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { openModal } from '../../../../../../../lib/cloud/libraries/overlays/modalUtilities.svelte';
	import DocumentSelectionModal from '../../../../../../../lib/ui/DocumentSelectionModal.svelte';

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

<Modal
	opened={page.state?.modal?.name === 'patientIncomplete'}
	title="Patient incomplet"
	body="Veuillez compléter les informations du patient avant de continuer."
	buttonTextConfirm="Compléter les informations du patient"
	onAccepted={() => {
		goto(`/dashboard/patients/${patient.patient_id}/update`);
	}} />

<Modal
	opened={page.state?.modal?.name === 'documentSelection'}
	title="Sélectionner un document"
	body="Veuillez sélectionner un document à ajouter.">
	<DocumentSelectionModal {accords} />
</Modal>
<SectionTitleWithTabs titre="Documents" className="space-x-2" {tabs}>
	{#snippet actions()}
		<BoutonPrincipalAvecIcone
			size="sm"
			onclick={() => {
				if (!patient.is_complete) {
					openModal({ name: 'patientIncomplete' });
				} else {
					openModal({ name: 'documentSelection' });
				}
			}}
			inner={$t('document.list', 'accord')}
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
