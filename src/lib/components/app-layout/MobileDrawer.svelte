<script>
	import { page } from '$app/state';
	import BackDrop from '../../cloud/libraries/command-palette/BackDrop.svelte';
	import SignOutIcon from '../../ui/svgs/SignOutIcon.svelte';
	import DarkModeSwitch from '../../cloud/libraries/DarkModeSwitch.svelte';
	import { t } from '../../i18n';
	import { getContext } from 'svelte';

	const modals = getContext('appLayoutModals');

	let { showDrawer = $bindable(), logo, menuItems } = $props();
</script>

<div
	class="relative z-10 lg:hidden {!showDrawer ? 'pointer-events-none' : ''}"
	role="dialog"
	aria-modal="true">
	<BackDrop display={showDrawer} color="bg-gray-900/80" z="" />

	<div class="fixed inset-0 flex">
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
			<div
				class="pt-safe flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2 dark:bg-gray-900 dark:ring dark:ring-white/10 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
				<div class="flex h-16 shrink-0 items-center">
					<img class="h-8 w-auto" src={logo} alt="Kiné Helper" />
				</div>
				<nav class="mt-4 flex flex-1 flex-col">
					<ul role="list" class="flex flex-1 flex-col gap-y-7">
						<li>
							<ul role="list" class="-mx-2 space-y-1">
								{#each menuItems as { href, svg, name }}
									<li>
										<!--
										Current: "bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-white",
										 Default: "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5" -->
										<a
											{href}
											class={[
												'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
												page.url.pathname === href
													? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
													: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
											]}>
											<svg
												class="size-6 shrink-0 {page.url.pathname === href
													? 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
													: 'text-gray-700 group-hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'}"
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
							<!-- Current: "bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-white", Default: "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5" -->
							<ul role="list" class="-mx-2 mt-2 space-y-1">
								<!--! Bouton pour se déconnecter -->
								<li>
									<button
										onclick={modals.signout}
										class="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white">
										<span
											class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:group-hover:border-white/20 dark:group-hover:text-white">
											<SignOutIcon class="size-4 shrink-0 text-gray-400" />
										</span>
										{$t('sidebar', 'logout', null, 'Log out')}
									</button>
								</li>
								<!--! Bouton pour accéder à la documentation -->
								<li>
									<button
										onclick={modals.gotoOnlineDoc}
										class="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white">
										<span
											class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:group-hover:border-white/20 dark:group-hover:text-white">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="size-4 shrink-0 text-gray-400">
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
										onclick={modals.bugReport}
										class="group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white">
										<span
											class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 dark:border-white/10 dark:bg-white/5 dark:group-hover:border-white/20"
											>?</span>
										{$t('sidebar', 'bugReport')}
									</button>
								</li>
								<DarkModeSwitch isOpen={true} />
							</ul>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	</div>
</div>
