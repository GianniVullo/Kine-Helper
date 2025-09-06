<script>
	import { t } from '../../../../../../../lib/i18n';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import BoutonSecondaireAvecIcone from '../../../../../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import { goto } from '$app/navigation';
	import { setContext } from 'svelte';
	import FactureCreationModal from '$lib/ui/FactureCreationModal.svelte';
	import Modal from '../../../../../../../lib/cloud/libraries/overlays/Modal.svelte';
	import { openModal } from '../../../../../../../lib/cloud/libraries/overlays/modalUtilities.svelte';

	let { data, children } = $props();

	let { patient, sp } = data;

	let factures = $state(sp.factures);
	console.log('factures In layuot', factures);
	setContext('factures', factures);

	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}`;

	let tabs = [
		{
			label: 'Attestations',
			value: homeUrl() + `/attestations`
		},
		{
			label: 'Factures',
			value: homeUrl() + `/attestations/factures`
		}
	];
</script>

<Modal
	opened={page.state.modal?.name === 'factureCreationModal'}
	title={$t('otherModal', 'fcreate.title')}>
	<FactureCreationModal {sp} {patient} {factures} />
</Modal>
<Modal
	opened={page.state.modal?.name === 'noAttestation'}
	title="Pas d'attestations"
	body="Veuillez créer une attestation avant de continuer."
	buttonTextCancel="none"
	buttonTextConfirm="Ok" />
<Modal
	opened={page.state.modal?.name === 'patientIncomplete'}
	title="Patient incomplet"
	,
	body={'Kiné Helper a besoin que vous complétiez les champs suivant avant de continuer. ' +
		'<ul class="mt-3 text-gray-900 font-medium space-y-2">' +
		page.state?.modal?.fields.map((field) => `<li>- ${field}</li>`) +
		'</ul>'}
	buttonTextConfirm="Compléter les informations du patient"
	onAccepted={() => {
		goto(`/dashboard/patients/${patient.patient_id}/update`);
	}} />
<Modal
	opened={page.state.modal?.name === 'noPrescription'}
	title="Pas de prescription"
	body="Veuillez ajouter une prescription avant de continuer."
	buttonTextConfirm="Ajouter une prescription"
	onAccepted={() => {
		goto(
			`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`
		);
	}} />
<Modal
	opened={page.state.modal?.name === 'createSeance'}
	title="Il n'y a pas de séance à attester"
	body="Voulez-vous créer une nouvelle séance ?"
	buttonTextConfirm="Créer une nouvelle séance"
	buttonTextCancel="Annuler"
	onAccepted={() => {
		goto(
			`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create`
		);
	}} />

<SectionTitleWithTabs
	titre={$t('form.generateur', 'tarification.title')}
	className="space-x-2"
	{tabs}>
	{#snippet actions()}
		<BoutonSecondaireAvecIcone
			onclick={() => {
				if (sp.attestations.length > 0) {
					openModal({ name: 'factureCreationModal' });
				} else {
					openModal({ name: 'noAttestation' });
				}
			}}
			inner={$t('attestation.detail', 'bill')}
			icon={addIcon} />
		<BoutonPrincipalAvecIcone
			onclick={() => {
				console.log(patient);
				if (!patient.is_complete) {
					openModal({ name: 'patientIncomplete', fields: patient.missing_fields });
				} else if (sp.prescriptions.length === 0) {
					openModal({ name: 'noPrescription' });
				} else if (sp.seances.filter((seance) => !seance.has_been_attested).length === 0) {
					openModal({ name: 'createSeance' });
				} else {
					goto(
						`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create-none`
					);
				}
			}}
			className="ml-3 inline-flex items-center bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			inner="Attestation"
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>
{@render children()}
