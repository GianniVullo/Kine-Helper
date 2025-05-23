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
	import Drawer from '../../../../../../../lib/cloud/libraries/overlays/Drawer.svelte';
	import AccordForm from '../../../../../../../lib/cloud/components/forms/documents/accords/AccordForm.svelte';

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

<Drawer
	opened={page.state.drawer?.name === 'accordCreate'}
	title={`Création d'${page.state.drawer?.docType === 'A' ? 'une Annexe A' : 'une Annexe B'}`}
	description="Panel de contrôle de votre Annexe.">
	<AccordForm
		{patient}
		{sp}
		docType={page.state.drawer?.docType}
		accord={page.state.drawer?.accord} />
</Drawer>

<Modal
	opened={page.state?.modal?.name === 'patientIncomplete'}
	title="Patient incomplet"
	body={'Kiné Helper a besoin que vous complétiez les champs suivant avant de continuer. ' +
		'<ul class="mt-3 text-gray-900 font-medium space-y-2">' +
		page.state?.modal?.fields.map((field) => `<li>- ${field}</li>`) +
		'</ul>'}
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
			onclick={() => {
				if (!patient.is_complete) {
					openModal({ name: 'patientIncomplete', fields: patient.missing_fields });
				} else {
					openModal({ name: 'documentSelection' });
				}
			}}
			inner={$t('document.list', 'accord')}
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
