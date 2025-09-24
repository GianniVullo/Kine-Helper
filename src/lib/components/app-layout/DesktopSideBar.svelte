<script>
	import { page } from '$app/state';
	import { t, locale } from '$lib/i18n/index';
	import { bookIcon, signOutIcon } from '../../ui/svgs/IconSnippets.svelte';
	import { openModal } from '../../cloud/libraries/overlays/modalUtilities.svelte';
	import MenuHeader from './MenuHeader.svelte';
	import OrganizationWidget from './OrganizationWidget.svelte';
	import DarkModeSwitch from '../../cloud/libraries/DarkModeSwitch.svelte';

	let { sidePanel, menuItems } = $props();
</script>

<div
	id="main-sidebar"
	class={[
		'hidden duration-300 lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:flex-col dark:bg-gray-900',
		sidePanel.isOpen ? 'lg:w-72' : 'lg:w-20'
	]}>
	<!-- Sidebar component, swap this element with another sidebar if you like -->
	<div
		class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:border-white/10 dark:bg-black/10">
		<MenuHeader {sidePanel} />
		<nav class="flex flex-1 flex-col px-6">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<li>
					<div class="text-xs/6 font-semibold text-gray-400 dark:text-gray-500">Menu</div>
					<ul role="list" class="-mx-2 mt-2 space-y-1">
						<!-- Current: "bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-white", Default: "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5" -->
						{#each menuItems as { href, svg, name, active }}
							<li aria-current={active ? 'page' : undefined}>
								<a
									{href}
									class={[
										'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
										active || page.url.pathname === href
											? 'bg-gray-50 text-indigo-600 dark:bg-white/5 dark:text-white'
											: 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
										sidePanel.isOpen ? '' : 'items-center justify-center'
									]}>
									<svg
										class="size-6 shrink-0 {active || page.url.pathname === href
											? 'text-indigo-600 dark:text-indigo-400'
											: 'text-sidebar-600'}"
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
					<!-- Current: "bg-gray-50 dark:bg-white/5 text-indigo-600 dark:text-white", Default: "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5" -->
					<div class="text-xs/6 font-semibold text-gray-400 dark:text-gray-500">Actions</div>
					<ul role="list" class="-mx-2 mt-2 space-y-1">
						{#snippet secondaryAction({
							icon,
							modalName,
							label,
							className = 'size-4 shrink-0 text-gray-700 dark:text-gray-500 flex items-center justify-center'
						})}
							<li>
								<button
									onclick={() => openModal({ name: modalName })}
									class={[
										'group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold  text-gray-700 hover:bg-gray-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
										sidePanel.isOpen ? '' : 'justify-center text-center'
									]}>
									<span
										class={[
											'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[0.625rem] font-medium text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:group-hover:border-white/20 dark:group-hover:text-white',
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
						<!--! Bouton pour signaler un bug/une suggestion -->
						{@render secondaryAction({
							modalName: 'bugReport',
							icon: questionMark,
							label: $t('sidebar', 'bugReport')
						})}
						<DarkModeSwitch isOpen={sidePanel.isOpen} />
					</ul>
				</li>
				<!-- {@render TeamWidgetDesktop()} -->
				<OrganizationWidget {sidePanel} />
			</ul>
		</nav>
	</div>
</div>
