<script>
	import SpTitle from '../../../../../../lib/patient-detail/SPTitle.svelte';
	import { t } from '../../../../../../lib/i18n';
	import { page } from '$app/state';
	import Tabs from '../../../../../../lib/components/Tabs.svelte';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { children, data } = $props();

	const homeUrl = () =>
		`/dashboard/patients/${data.patient.patient_id}/situation-pathologique/${data.sp.sp_id}`;
	const tabs = $derived([
		{
			href: homeUrl(),
			nom: 'Home',
			actif: page.url.pathname === homeUrl()
		},
		{
			href: homeUrl() + `/prescriptions`,
			nom: $t('sp.detail', 'prescriptions'),
			actif: page.url.pathname === homeUrl() + `/prescriptions`
		},
		{
			href: homeUrl() + `/attestations`,
			nom: $t('form.generateur', 'tarification.title'),
			actif: page.url.pathname.startsWith(homeUrl() + `/attestations`)
		},
		{
			href: homeUrl() + `/documents`,
			nom: $t('sp.detail', 'documents'),
			actif: page.url.pathname === homeUrl() + `/documents`
		},
		{
			href: homeUrl() + `/seances`,
			nom: $t('patients.detail', 'prestations'),
			actif: page.url.pathname === homeUrl() + `/seances`
		}
	]);
</script>

{#if data.sp === 'none'}
	Error, no sp found
{:else}
	<SpTitle patient={data.patient} currentSp={data.sp} />
	<div class="-mt-5 mb-5 flex w-full items-center justify-start px-4 py-1 sm:py-1"></div>
	<!--* Tabs -->
	<Tabs
		className="w-full text-center flex justify-center sm:block border-b border-gray-300 shadow-sm"
		{tabs} />
	{@render children()}
{/if}
