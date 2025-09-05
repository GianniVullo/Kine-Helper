<script>
	import { page } from '$app/state';
	import SectionTitleWithTabs from '../../../lib/components/SectionTitleWithTabs.svelte';
	import { t } from '../../../lib/i18n';
	import { terminal } from 'virtual:terminal';

	/** @type {{ data: import('./$types').LayoutData, children: import('svelte').Snippet }} */
	let { data, children } = $props();
	let tabs = $derived([
		{
			label: 'Profil',
			value: '/dashboard/settings/profil',
			actif: page.route.id.includes('/settings/profil')
		},
		{
			label: 'Périphériques',
			value: '/dashboard/settings/devices',
			actif: page.route.id.includes('/settings/devices')
		},
		{
			label: 'Organisation',
			value: '/dashboard/settings/organisation',
			actif: page.route.id.includes('/settings/organisation')
		},
		{
			label: 'Rôles et permissions',
			value: '/dashboard/settings/roles-permissions',
			actif: page.route.id.includes('/settings/roles-permissions')
		}
		// {
		// 	label: 'Notifications',
		// 	value: '/dashboard/settings/notifications',
		// 	actif: false
		// },
		// {
		// 	label: 'Sécurité',
		// 	value: '/dashboard/settings/security',
		// 	actif: false
		// },
		// {
		// 	label: 'Intégrations',
		// 	value: '/dashboard/settings/integrations',
		// 	actif: false
		// },
		// {
		// 	label: 'Apparence',
		// 	value: '/dashboard/settings/appearance',
		// 	actif: false
		// }
	]);
</script>

<!-- <SectionTitleWithTabs titre={$t('settings', 'title')} {tabs} actions={Actions} /> -->
<SectionTitleWithTabs className="space-x-2 mb-16" {tabs} selectId="accords-tabs-select" />

{@render children()}
