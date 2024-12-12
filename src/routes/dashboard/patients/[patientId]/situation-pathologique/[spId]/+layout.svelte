<script>
	import SpTitle from '../../../../../../lib/patient-detail/SPTitle.svelte';
	import { patients } from '../../../../../../lib/stores/PatientStore';
	import { t } from '../../../../../../lib/i18n';
	import { page } from '$app/stores';
	import Tabs from '../../../../../../lib/components/Tabs.svelte';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { children } = $props();
	const patient = $patients.find((p) => p.patient_id === $page.params.patientId);
	const currentSp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	console.log('THE PAGE', $page);

	const homeUrl = () =>
		`/dashboard/patients/${patient.patient_id}/situation-pathologique/${currentSp.sp_id}`;
	const tabs = [
		{
			href: homeUrl(),
			nom: 'Home',
			actif: $page.url.pathname === homeUrl()
		},
		{
			href: homeUrl() + `/prescriptions`,
			nom: $t('sp.detail', 'prescriptions'),
			actif: $page.url.pathname === homeUrl() + `/prescriptions`
		},
		{
			href: homeUrl() + `/attestations`,
			nom: $t('form.generateur', 'tarification.title'),
			actif: $page.url.pathname.startsWith(homeUrl() + `/attestations`)
		},
		{
			href: homeUrl() + `/documents`,
			nom: $t('sp.detail', 'documents'),
			actif: $page.url.pathname === homeUrl() + `/documents`
		},
		{
			href: homeUrl() + `/seances`,
			nom: $t('patients.detail', 'prestations'),
			actif: $page.url.pathname === homeUrl() + `/seances`
		}
	];
</script>

<SpTitle {patient} {currentSp} />
<div class="-mt-5 mb-5 flex w-full items-center justify-start px-4 py-1 sm:py-1"></div>

<!--* Tabs -->
<Tabs
	className="w-full text-center flex justify-center sm:block border-b border-gray-300 shadow-sm"
	{tabs} />

{@render children()}
