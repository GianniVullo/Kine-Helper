<script>
	import logo from '$lib/assets/logo.png';
	import { page } from '$app/state';
	import { t, locale } from '$lib/i18n/index';
	import { get } from 'svelte/store';
	import { afterNavigate } from '$app/navigation';
	import { SidePanel } from './SidePanel.svelte';
	import Modals from './Modals.svelte';
	import DesktopSideBar from './DesktopSideBar.svelte';
	import MobileDrawer from './MobileDrawer.svelte';
	import MobileTopBar from './MobileTopBar.svelte';

	let { children } = $props();
	let sidePanel = new SidePanel();
	let showDrawer = $state(false);
	let menuItems = $derived([
		{
			name: get(t)('sidebar', 'dashboard'),
			href: '/dashboard',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />`
		},
		{
			name: get(t)('sidebar', 'agenda'),
			href: '/dashboard/agenda',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />`
		},
		{
			name: get(t)('sidebar', 'patients'),
			href: '/dashboard/patients',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />`,
			active: page.route.id.includes('patients')
		},
		{
			name: 'Finances',
			href: '/dashboard/finances',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />`
		},
		{
			name: get(t)('sidebar', 'settings'),
			href: '/dashboard/settings/profil',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />`,
			active: page.route.id.includes('settings')
		}
	]);

	afterNavigate(() => {
		page;
		showDrawer = false;
	});
</script>

<Modals />

<div>
	<!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
	<MobileDrawer bind:showDrawer {logo} {menuItems} />
	<!-- Static sidebar for desktop -->
	<DesktopSideBar {sidePanel} {menuItems} />

	<!-- Static Topbar for Mobile -->
	<MobileTopBar bind:showDrawer {sidePanel} />

	<main class={['py-10 duration-300', sidePanel.isOpen ? 'lg:pl-72' : 'lg:pl-20']}>
		<div class="px-4 sm:px-6 lg:px-8">
			{@render children?.()}
		</div>
	</main>
</div>
