<script>
	import { t } from '../../../../../../../lib/i18n';
	import SectionTitleWithTabs from '../../../../../../../lib/components/SectionTitleWithTabs.svelte';
	import BoutonSecondaireAvecIcone from '../../../../../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import { addIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import { page } from '$app/state';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import { goto, pushState } from '$app/navigation';
	import { setContext } from 'svelte';

	let { data, children } = $props();

	let { patient, sp } = data;

	let factures = $state(sp.factures);
	setContext('factures', factures);

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
	const modals = {
		noAttestation: () => {
			pushState('', {
				modal: {
					title: "Pas d'attestations",
					description: 'Veuillez créer une attestation avant de continuer.',
					buttonTextCancel: 'none',
					buttonTextConfirm: 'Ok'
				}
			});
		},
		patientIcomplete: () => {
			pushState('', {
				modal: {
					title: 'Patient incomplet',
					description: `Kiné Helper a besoin que vous complétiez les champs suivant avant de continuer :\n<ul class="mt-3 font-medium space-y-2">${patient.missing_fields.map((field) => `<li>- ${field}</li>`).join('')}</ul>`,
					buttonTextConfirm: 'Compléter les informations du patient',
					href: `/dashboard/patients/${patient.patient_id}/update`
				}
			});
		},
		noPrescription: () => {
			pushState('', {
				modal: {
					title: 'Pas de prescription',
					description: 'Veuillez ajouter une prescription avant de continuer.',
					buttonTextConfirm: 'Ajouter une prescription',
					href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/prescriptions/create`
				}
			});
		},
		noSeance: () => {
			pushState('', {
				modal: {
					title: "Il n'y a pas de séance à attester",
					description: 'Voulez-vous créer une nouvelle séance ?',
					buttonTextConfirm: 'Créer une nouvelle séance',
					buttonTextCancel: 'Annuler',
					href: `/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create`
				}
			});
		}
	};
</script>

<SectionTitleWithTabs
	titre={$t('form.generateur', 'tarification.title')}
	className="space-x-2"
	tabsClassName="mb-0"
	{tabs}>
	{#snippet actions()}
		<BoutonSecondaireAvecIcone
			onclick={() => {
				if (sp.attestations.length > 0) {
					pushState('', { modal: { component: 'factureCreationModal' } });
				} else {
					modals.noAttestation();
				}
			}}
			inner={$t('attestation.detail', 'bill')}
			icon={addIcon} />
		<BoutonPrincipalAvecIcone
			onclick={(e) => {
				e.target.disabled = true;
				if (!patient.is_complete) {
					console.log('Patient incomplete !');
					modals.patientIcomplete();
				} else if (sp.prescriptions.length === 0) {
					modals.noPrescription();
				} else if (sp.seances.filter((seance) => !seance.has_been_attested).length === 0) {
					modals.noSeance();
				} else {
					goto(
						`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/attestations/create-none`
					);
				}
				e.target.disabled = false;
			}}
			additionnalCSS="ml-3"
			inner="Attestation"
			icon={addIcon} />
	{/snippet}
</SectionTitleWithTabs>

{@render children()}
