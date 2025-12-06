<script>
	import { page } from '$app/state';
	import SectionTitleWithTabs from '../../../lib/components/SectionTitleWithTabs.svelte';
	// import { t } from '../../../lib/i18n';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
	let tabs = $derived([
		{
			nom: 'Profil',
			href: '/dashboard/settings/profil',
			actif: page.route.id.includes('/settings/profil')
		},
		{
			nom: 'Périphériques',
			href: '/dashboard/settings/devices',
			actif: page.route.id.includes('/settings/devices')
		},
		{
			nom: 'Organisation',
			href: '/dashboard/settings/organisation',
			actif: page.route.id.includes('/settings/organisation')
		},
		{
			nom: 'Rôles et permissions',
			href: '/dashboard/settings/roles-permissions',
			actif: page.route.id.includes('/settings/roles-permissions')
		},
		{
			nom: 'Assistant de migration',
			href: '/dashboard/settings/migration-assistant',
			actif: page.route.id.includes('/settings/roles-permissions')
		}
		// {
		// 	nom: 'Notifications',
		// 	href: '/dashboard/settings/notifications',
		// 	actif: false
		// },
		// {
		// 	nom: 'Sécurité',
		// 	href: '/dashboard/settings/security',
		// 	actif: false
		// },
		// {
		// 	nom: 'Intégrations',
		// 	href: '/dashboard/settings/integrations',
		// 	actif: false
		// },
		// {
		// 	nom: 'Apparence',
		// 	href: '/dashboard/settings/appearance',
		// 	actif: false
		// }
	]);
</script>

<!-- <SectionTitleWithTabs titre={$t('settings', 'title')} {tabs} actions={Actions} /> -->
<SectionTitleWithTabs
	style="view-transition-name: settingsTab;"
	className="space-x-2 mb-16"
	{tabs}
	selectId="accords-tabs-select"
	tabsClassName="mb-0" />

{@render children()}
