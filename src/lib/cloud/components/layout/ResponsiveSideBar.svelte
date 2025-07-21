<script>
	import { supabase } from '../../../stores/supabaseClient';
	import logo from '$lib/assets/logo.png';
	import { page } from '$app/state';
	import { t, locale } from '$lib/i18n/index';
	import { get } from 'svelte/store';
	import SignOutIcon from '../../../ui/svgs/SignOutIcon.svelte';
	import {
		bookIcon,
		crossIcon,
		signOutIcon,
		viewColumnIcon
	} from '../../../ui/svgs/IconSnippets.svelte';
	import { open } from '@tauri-apps/plugin-shell';
	import BugReportModal from '../../../ui/BugReportModal.svelte';
	import Modal from '../../libraries/overlays/Modal.svelte';
	import { openModal } from '../../libraries/overlays/modalUtilities.svelte';
	import { goto, afterNavigate } from '$app/navigation';
	import CommandPaletteManualOpener from '../../libraries/command-palette/CommandPaletteManualOpener.svelte';
	import { SidePanel } from './SidePanel.svelte';
	import BackDrop from '../../libraries/command-palette/BackDrop.svelte';
	import { appState } from '../../../managers/AppState.svelte';

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
			href: '/dashboard/settings',
			svg: `<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />`
		}
	]);

	afterNavigate(() => {
		page;
		showDrawer = false;
	});
</script>

<Modal
	opened={page.state?.modal?.name === 'signout'}
	title="Déconnexion"
	body={get(t)('sidebar', 'logout.confirm')}
	buttonTextCancel={get(t)('shared', 'cancel')}
	buttonTextConfirm={get(t)('shared', 'confirm')}
	onAccepted={async () => {
		await supabase.auth.signOut();
		goto('/');
	}} />
<Modal
	opened={page.state?.modal?.name === 'bugReport'}
	title={get(t)('sidebar', 'bugReport')}
	body={$t('bugModal', 'description')}>
	<BugReportModal />
</Modal>
<Modal
	opened={page.state?.modal?.name === 'docModal'}
	title="Attention, vous allez être redirigé"
	body={$t(
		'sidebar',
		'docModal.body',
		null,
		'Attention vous allez être redirigé vers le site de la documentation'
	)}
	buttonTextCancel={$t('shared', 'cancel')}
	buttonTextConfirm="Consulter la documentation"
	onAccepted={async () => {
		await open(
			$locale === 'FR' ? 'https://kine-helper.be/tutoriels' : 'https://kine-helper.be/nl/tutorials'
		);
		history.back();
	}} />

{#snippet TeamWidgetDesktop()}
	<li class="-mx-6 mt-auto">
		<a
			href="#"
			class="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50">
			<div
				class="flex size-8 items-center justify-center rounded-full bg-gray-300 text-gray-600"
				alt="">
				{`${appState.user?.prenom?.charAt(0) || ''}${appState.user?.nom?.charAt(0) || ''}`}
			</div>
			<span class="sr-only">Your profile</span>
			{#if sidePanel.isOpen}
				<span aria-hidden="true"
					>{`${appState.user?.prenom || ''} ${appState.user?.nom || ''}`}</span>
			{/if}
		</a>
	</li>
{/snippet}
{#snippet TeamWidgetMobile()}<a href="#">
		<span class="sr-only">Paramètres</span>
		<div
			class="flex size-8 items-center justify-center rounded-full bg-gray-300 text-gray-600"
			alt="">
			{`${appState.user?.prenom?.charAt(0) || ''}${appState.user?.nom?.charAt(0) || ''}`}
		</div>
	</a>
{/snippet}

<div>
	<!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
	<div
		class="relative z-10 lg:hidden {!showDrawer ? 'pointer-events-none' : ''}"
		role="dialog"
		aria-modal="true">
		<!--
		Off-canvas menu backdrop, show/hide based on off-canvas menu state.
  
		Entering: "transition-opacity ease-linear duration-300"
		  From: "opacity-0"
		  To: "opacity-100"
		Leaving: "transition-opacity ease-linear duration-300"
		  From: "opacity-100"
		  To: "opacity-0"
	  -->
		<BackDrop display={showDrawer} color="bg-gray-900/80" z="" />

		<div class="fixed inset-0 flex">
			<!--
		  Off-canvas menu, show/hide based on off-canvas menu state.
  
		  Entering: "transition ease-in-out duration-300 transform"
			From: "-translate-x-full"
			To: "translate-x-0"
		  Leaving: "transition ease-in-out duration-300 transform"
			From: "translate-x-0"
			To: "-translate-x-full"
		-->
			<div
				class="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out {!showDrawer
					? '-translate-x-full'
					: 'translate-x-0'}">
				<!--
			Close button, show/hide based on off-canvas menu state.
  
			Entering: "ease-in-out duration-300"
			  From: "opacity-0"
			  To: "opacity-100"
			Leaving: "ease-in-out duration-300"
			  From: "opacity-100"
			  To: "opacity-0"
		  -->
				<div
					class="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out {showDrawer
						? 'opacity-100'
						: 'opacity-0'}">
					<button
						onclick={() => {
							showDrawer = false;
						}}
						type="button"
						class="-m-2.5 p-2.5">
						<span class="sr-only">Close sidebar</span>
						<svg
							class="size-6 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Sidebar component, swap this element with another sidebar if you like -->
				<div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-100 px-6 pb-2">
					<div class="flex h-16 shrink-0 items-center">
						<img class="h-8 w-auto" src={logo} alt="Kiné Helper" />
					</div>
					<nav class="flex flex-1 flex-col">
						<ul role="list" class="flex flex-1 flex-col gap-y-7">
							<li>
								<ul role="list" class="-mx-2 space-y-1">
									<!-- Current: "", Default: "" -->
									{#each menuItems as { href, svg, name }}
										<li>
											<a
												{href}
												class={[
													'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
													page.url.pathname === href
														? 'bg-gray-50 text-indigo-600'
														: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
												]}>
												<svg
													class="size-6 shrink-0 {page.url.pathname === href
														? 'bg-gray-50 text-indigo-600'
														: 'text-gray-400 group-hover:text-indigo-600'}"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="1.5"
													stroke="currentColor"
													aria-hidden="true"
													data-slot="icon">
													{@html svg}
												</svg>
												{name}
											</a>
										</li>
									{/each}
								</ul>
							</li>
							<li>
								<div class="text-xs/6 font-semibold text-gray-400">Actions</div>
								<ul role="list" class="-mx-2 mt-2 space-y-1">
									<!--! Bouton pour se déconnecter -->
									<li>
										<button
											onclick={() => openModal({ name: 'confirm' })}
											class="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
											<span
												class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600">
												<SignOutIcon
													class="size-4 shrink-0 text-gray-400 group-hover:text-indigo-600" />
											</span>
											{$t('sidebar', 'logout', null, 'Log out')}
										</button>
									</li>
									<!--! Bouton pour accéder à la documentation -->
									<li>
										<button
											onclick={() => openModal({ name: 'docModal' })}
											class="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
											<span
												class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke-width="1.5"
													stroke="currentColor"
													class="size-4 shrink-0 text-gray-400 group-hover:text-indigo-600">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
												</svg>
											</span>
											{$t('sidebar', 'doc')}
										</button>
									</li>
									<!--! Bouton pour signaler un bug/une seggestion -->
									<li>
										<button
											onclick={() => openModal({ name: 'bugReport' })}
											class="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600">
											<span
												class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600"
												>?</span>
											{$t('sidebar', 'bugReport')}
										</button>
									</li>
								</ul>
							</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	</div>

	<!-- Static sidebar for desktop -->
	<div
		id="main-sidebar"
		class={[
			'hidden duration-300 lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:flex-col',
			sidePanel.isOpen ? 'lg:w-72' : 'lg:w-20'
		]}>
		<!-- Sidebar component, swap this element with another sidebar if you like -->
		<div
			class={[
				'flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6',
				sidePanel.isOpen ? 'bg-gray-300/60' : 'bg-gray-900'
			]}>
			<div
				class={[
					'flex h-16 shrink-0 items-center',
					sidePanel.isOpen ? 'flex-row space-x-5' : 'mt-5 mb-16 flex-col items-center space-y-5'
				]}>
				<img class="h-8 w-auto" src={logo} alt="Kiné Helper" />
				<CommandPaletteManualOpener shrink={!sidePanel.isOpen} />
				{#if sidePanel.isOpen}
					<button
						onclick={() => sidePanel.toggle()}
						disabled={sidePanel.loading}
						class="flex w-8 items-center justify-center"
						>{@render crossIcon('size-5 text-gray-500')}</button>
				{:else}
					<button
						onclick={() => sidePanel.toggle()}
						disabled={sidePanel.loading}
						class="flex w-8 items-center justify-center"
						>{@render viewColumnIcon('size-5 text-gray-500')}</button>
				{/if}
			</div>
			<nav class="flex flex-1 flex-col">
				<ul role="list" class="flex flex-1 flex-col gap-y-7">
					<li>
						<div class="text-xs/6 font-semibold text-gray-400">Menu</div>
						<ul role="list" class="-mx-2 space-y-1">
							{#each menuItems as { href, svg, name, active }}
								<li aria-current={active ? 'page' : undefined}>
									<a
										{href}
										class={[
											'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
											active || page.url.pathname === href
												? 'bg-gray-50 text-indigo-600'
												: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
											sidePanel.isOpen ? '' : 'items-center justify-center'
										]}>
										<svg
											class="size-6 shrink-0 {active || page.url.pathname === href
												? 'bg-gray-50 text-indigo-600'
												: 'text-gray-400 group-hover:text-indigo-600'}"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											aria-hidden="true"
											data-slot="icon">
											{@html svg}
										</svg>
										{#if sidePanel.isOpen}
											{name}
										{/if}
									</a>
								</li>
							{/each}
						</ul>
					</li>
					<li>
						<div class="text-xs/6 font-semibold text-gray-400">Actions</div>
						<ul role="list" class="-mx-2 mt-2 space-y-1">
							{#snippet secondaryAction({
								icon,
								modalName,
								label,
								className = 'size-4 shrink-0 text-gray-700 group-hover:text-indigo-600'
							})}
								<li>
									<button
										onclick={() => openModal({ name: modalName })}
										class={[
											'group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700  hover:text-indigo-600',
											sidePanel.isOpen ? '' : 'justify-center text-center'
										]}>
										<span
											class={[
												'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600',
												sidePanel.isOpen ? 'bg-white' : 'bg-gray-400'
											]}>
											{@render icon(className)}
										</span>
										{#if sidePanel.isOpen}
											{label}
										{/if}
									</button>
								</li>
							{/snippet}
							<!--! Bouton pour se déconnecter -->
							{@render secondaryAction({
								icon: signOutIcon,
								modalName: 'signout',
								label: $t('sidebar', 'logout', null, 'Log out')
							})}
							<!--! Bouton pour accéder à la documentation -->
							{@render secondaryAction({
								icon: bookIcon,
								modalName: 'docModal',
								label: $t('sidebar', 'doc')
							})}
							{#snippet questionMark(cls)}
								<span class={cls}>?</span>
							{/snippet}
							<!--! Bouton pour signaler un bug/une seggestion -->
							{@render secondaryAction({
								modalName: 'bugReport',
								icon: questionMark,
								className: sidePanel.isOpen
									? 'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 group-hover:border-indigo-600 group-hover:text-indigo-600'
									: 'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-400 text-xs font-medium text-gray-700 group-hover:border-indigo-600 group-hover:text-indigo-600',
								label: $t('sidebar', 'bugReport')
							})}
						</ul>
					</li>
					{@render TeamWidgetDesktop()}
				</ul>
			</nav>
		</div>
	</div>

	<div
		class="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
		{#if !showDrawer}
			<button
				onclick={() => {
					showDrawer = true;
				}}
				type="button"
				class="-m-2.5 p-2.5 text-gray-700 lg:hidden">
				<span class="sr-only">Open sidebar</span>
				<svg
					class="size-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
					data-slot="icon">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
				</svg>
			</button>
		{:else}
			<button
				onclick={() => {
					showDrawer = false;
				}}
				type="button"
				class="-m-2.5 p-2.5">
				<span class="sr-only">Close sidebar</span>
				<svg
					class="size-6 text-black"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
					data-slot="icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
		<div class="flex flex-1 items-center text-sm/6 font-semibold text-gray-900">
			<!-- {menuItems.find((p) => p.href === page.url.pathname)?.name} -->
			<CommandPaletteManualOpener />
		</div>
		{@render TeamWidgetMobile()}
	</div>

	<main class={['py-10 duration-300', sidePanel.isOpen ? 'lg:pl-72' : 'lg:pl-20']}>
		<div class="px-4 sm:px-6 lg:px-8">
			{@render children?.()}
		</div>
	</main>
</div>
