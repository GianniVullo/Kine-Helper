<script>
	import logo from '$lib/assets/logo.png';
	import { SignOutIcon, ChevronRightIcon, ChevronLeftIcon } from './ui/svgs/index';
	import { LightSwitch, getModalStore } from '@skeletonlabs/skeleton';
	import { supabase } from '../lib/stores/supabaseClient';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore();

	let menuItems = [
		{
			name: 'Tableau de  bord',
			path: '/dashboard',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />`
		},
		{
			name: 'Agenda',
			path: '/dashboard/agenda',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />`
		},
		{
			name: 'Patients',
			path: '/dashboard/patients',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />`
		},
		// {
		// 	name: 'Tarification',
		// 	path: '/dashboard/billing',
		// 	svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`
		// },
		{
			name: 'Paramètres',
			path: '/',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />`
		}
	];
	export let isMinimized;

	const modal = {
		type: 'confirm',
		// Data
		title: 'Confirmation',
		body: 'Êtes-vous sûr de vouloir vous déconnecter ?',
		buttonTextCancel: 'Annuler',
		buttonTextConfirm: 'Confirmer',
		buttonPositive: 'variant-filled-primary',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: async (r) => {
			console.log(r);
			if (r) {
				await supabase.auth.signOut();
				goto('/');
			}
		}
	};
	const bugReportModal = {
		type: 'component',
		component: 'bugReport'
	};
</script>

<!-- Sidebar Navigation -->
<aside
	data-minimized={isMinimized}
	class="isMinimized group fixed left-0 top-0 z-10 h-96 w-screen overflow-clip border-b border-surface-400 bg-gradient-to-br from-surface-200 to-surface-100 p-6 text-white shadow-lg duration-200 ease-in-out data-[minimized=true]:h-16 data-[minimized=true]:from-surface-300 data-[minimized=true]:to-surface-200 data-[minimized=true]:p-0 dark:border-surface-800 dark:from-surface-700 dark:to-surface-800 dark:data-[minimized=true]:from-surface-700 dark:data-[minimized=true]:to-surface-800 md:h-screen md:w-64 md:border-r data-[minimized=true]:md:h-screen data-[minimized=true]:md:w-12">
	<h2 class:mb-6={!isMinimized} class="text-xl font-medium text-primary-600 dark:text-primary-400">
		{isMinimized ? '' : 'Kiné Helper'}
	</h2>

	<div
		class="absolute -right-8 -top-6 h-14 w-14 rounded-full bg-sky-600 opacity-25 duration-200 ease-in-out group-data-[minimized=false]:-right-32 group-data-[minimized=false]:-top-20 group-data-[minimized=true]:hidden group-data-[minimized=false]:h-48 group-data-[minimized=false]:w-48 dark:opacity-60">
	</div>

	<nav
		class:items-center={isMinimized}
		class:md:items-start={isMinimized}
		class:md:mt-6={isMinimized}
		class="relative mt-0 flex h-full w-full">
		<ul
			data-minimized={isMinimized}
			class="relative data-[minimized=true]:flex data-[minimized=true]:w-full data-[minimized=true]:items-center data-[minimized=true]:justify-start data-[minimized=true]:sm:justify-center data-[minimized=true]:md:block">
			<li
				class="absolute left-0 mt-0 flex items-center justify-center px-2 py-2 md:static md:mt-2 md:px-0 md:py-0">
				<img
					src={logo}
					class="hidden w-[60%] group-data-[minimized=false]:hidden sm:block md:w-auto md:px-2 md:py-2"
					alt="" />
			</li>
			{#each menuItems as item}
				<li class:justify-center={isMinimized} class="flex items-center justify-center">
					<!-- side Icon -->
					<a
						href={item.path}
						class="my-2 flex rounded-lg px-4 text-surface-800 no-underline duration-200 ease-in hover:bg-gray-50 hover:bg-opacity-10 group-data-[minimized=true]:items-center group-data-[minimized=true]:px-2 dark:text-surface-200">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6 grow stroke-primary-500 group-data-[minimized=true]:h-8 group-data-[minimized=true]:w-8 group-data-[minimized=true]:stroke-primary-600 group-data-[minimized=true]:duration-200 group-data-[minimized=true]:hover:scale-105 group-data-[minimized=true]:hover:stroke-primary-700 dark:stroke-primary-200 group-data-[minimized=true]:dark:stroke-primary-400 group-data-[minimized=true]:dark:hover:stroke-primary-300">
							{@html item.svg}
						</svg>
						{#if !isMinimized}
							<p class="ml-3 grow-[2]">{item.name}</p>
						{/if}
					</a>
				</li>
			{/each}
			<!--! Bouton pour se déconnecter -->
			<li class:justify-center={isMinimized} class="flex items-center justify-center">
				<button
					class="flex rounded-lg px-4 py-2 text-surface-800 no-underline duration-200 ease-in hover:bg-gray-50 hover:bg-opacity-10 group-data-[minimized=true]:items-center group-data-[minimized=true]:px-2 dark:text-surface-200"
					on:click={() => modalStore.trigger(modal)}>
					<SignOutIcon
						class="h-6 w-6 grow stroke-primary-500 group-data-[minimized=true]:h-8 group-data-[minimized=true]:w-8 group-data-[minimized=true]:stroke-primary-600 group-data-[minimized=true]:duration-200 group-data-[minimized=true]:hover:scale-105 group-data-[minimized=true]:hover:stroke-primary-700 dark:stroke-primary-200 group-data-[minimized=true]:dark:stroke-primary-400 group-data-[minimized=true]:dark:hover:stroke-primary-300" />
					{#if !isMinimized}
						<p class="ml-3 grow-[2]">Se déconnecter</p>
					{/if}
				</button>
			</li>
			<!--! Bouton pour signaler un bug/une seggestion -->
			<li class:justify-center={isMinimized} class="flex items-center justify-center">
				<button
					class="flex rounded-lg px-4 py-2 text-surface-800 no-underline duration-200 ease-in hover:bg-gray-50 hover:bg-opacity-10 group-data-[minimized=true]:items-center group-data-[minimized=true]:px-2 dark:text-surface-200"
					on:click={() => modalStore.trigger(bugReportModal)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-6 w-6 grow stroke-primary-500 group-data-[minimized=true]:h-6 group-data-[minimized=true]:w-6 group-data-[minimized=true]:stroke-primary-600 group-data-[minimized=true]:duration-200 group-data-[minimized=true]:hover:scale-105 group-data-[minimized=true]:hover:stroke-primary-700 dark:stroke-primary-200 group-data-[minimized=true]:dark:stroke-primary-400 group-data-[minimized=true]:dark:hover:stroke-primary-300">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146M8.683 5a6.032 6.032 0 0 1-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0 1 15.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 0 0-.575-1.752M4.921 6a24.048 24.048 0 0 0-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 0 1-5.223 1.082" />
					</svg>
					{#if !isMinimized}
						<p class="ml-3 grow-[2]">Signaler un bug/suggestion</p>
					{/if}
				</button>
			</li>
			<div
				class="absolute -bottom-8 -left-10 h-14 w-14 rounded-full bg-primary-600 opacity-25 duration-200 group-data-[minimized=false]:-left-44 group-data-[minimized=true]:hidden group-data-[minimized=false]:h-48 group-data-[minimized=false]:w-48 dark:opacity-60 md:relative group-data-[minimized=false]:md:bottom-6">
			</div>
			{#if !isMinimized}
				<LightSwitch />
			{/if}
		</ul>
	</nav>
	<!-- Minimize button -->
	<button
		class="absolute right-2 top-3 p-2 duration-200 hover:drop-shadow-md group-data-[minimized=true]:left-auto group-data-[minimized=true]:right-2 md:bottom-4 md:top-auto group-data-[minimized=true]:md:left-1"
		on:click={() => {
			isMinimized = !isMinimized;
		}}>
		{#if !isMinimized}
			<ChevronLeftIcon class="hidden h-6 w-6 stroke-black dark:stroke-surface-100 md:block" />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="block h-6 w-6 stroke-black dark:stroke-surface-100 md:hidden">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else}
			<ChevronRightIcon class="hidden h-6 w-6 stroke-black dark:stroke-surface-100 md:block" />
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="block h-6 w-6 stroke-black dark:stroke-surface-100 md:hidden">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
		{/if}
	</button>
</aside>
