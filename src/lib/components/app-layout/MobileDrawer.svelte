<script>
	import { page } from '$app/state';
	import BackDrop from '../../cloud/libraries/command-palette/BackDrop.svelte';
	import { openModal } from '../../cloud/libraries/overlays/modalUtilities.svelte';
	import SignOutIcon from '../../ui/svgs/SignOutIcon.svelte';

	import { t } from '../../i18n';

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
													? 'text-sidebar-600 bg-gray-50'
													: 'hover:text-sidebar-600 text-gray-700 hover:bg-gray-50'
											]}>
											<svg
												class="size-6 shrink-0 {page.url.pathname === href
													? 'text-sidebar-600 bg-gray-50'
													: 'group-hover:text-sidebar-600 text-gray-400'}"
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
										onclick={() => openModal({ name: 'signout' })}
										class="group hover:text-sidebar-600 flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50">
										<span
											class="group-hover:border-sidebar-600 group-hover:text-sidebar-600 flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400">
											<SignOutIcon
												class="group-hover:text-sidebar-600 size-4 shrink-0 text-gray-400" />
										</span>
										{$t('sidebar', 'logout', null, 'Log out')}
									</button>
								</li>
								<!--! Bouton pour accéder à la documentation -->
								<li>
									<button
										onclick={() => openModal({ name: 'docModal' })}
										class="group hover:text-sidebar-600 flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50">
										<span
											class="group-hover:border-sidebar-600 group-hover:text-sidebar-600 flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="group-hover:text-sidebar-600 size-4 shrink-0 text-gray-400">
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
										class="group hover:text-sidebar-600 flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50">
										<span
											class="group-hover:border-sidebar-600 group-hover:text-sidebar-600 flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-400"
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
