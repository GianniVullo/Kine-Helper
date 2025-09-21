<script>
	import { page } from '$app/state';
	import { t, locale } from '$lib/i18n/index';
	import { bookIcon, signOutIcon } from '../../ui/svgs/IconSnippets.svelte';
	import { openModal } from '../../cloud/libraries/overlays/modalUtilities.svelte';
	import MenuHeader from './MenuHeader.svelte';
	import OrganizationWidget from './OrganizationWidget.svelte';
	let { sidePanel, menuItems } = $props();
</script>

<div
	id="main-sidebar"
	class={[
		'hidden duration-300 lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:flex-col',
		sidePanel.isOpen ? 'lg:w-72' : 'lg:w-20'
	]}>
	<!-- Sidebar component, swap this element with another sidebar if you like -->
	<div
		class={[
			'flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200',
			sidePanel.isOpen ? 'bg-gray-300/60' : 'bg-gray-800'
		]}>
		<MenuHeader {sidePanel} />
		<nav class="flex flex-1 flex-col px-6">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<li>
					<div class="text-xs/6 font-semibold text-gray-400">Menu</div>
					<ul role="list" class="-mx-2 mt-2 space-y-1">
						{#each menuItems as { href, svg, name, active }}
							<li aria-current={active ? 'page' : undefined}>
								<a
									{href}
									class={[
										'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
										active || page.url.pathname === href
											? 'text-sidebar-600 bg-gray-50'
											: 'hover:text-sidebar-600 text-gray-700 hover:bg-gray-50',
										sidePanel.isOpen ? '' : 'items-center justify-center'
									]}>
									<svg
										class="size-6 shrink-0 {active || page.url.pathname === href
											? 'text-sidebar-600 bg-gray-50'
											: 'text-sidebar-400 group-hover:text-sidebar-600'}"
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
							className = 'size-4 shrink-0 text-gray-700 group-hover:text-sidebar-600'
						})}
							<li>
								<button
									onclick={() => openModal({ name: modalName })}
									class={[
										'group hover:text-sidebar-600 flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold  text-gray-700',
										sidePanel.isOpen ? '' : 'justify-center text-center'
									]}>
									<span
										class={[
											'group-hover:border-sidebar-600 group-hover:text-sidebar-600 flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-[0.625rem] font-medium text-gray-400',
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
							className: sidePanel.isOpen
								? 'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 group-hover:border-sidebar-600 group-hover:text-sidebar-600'
								: 'flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-400 text-xs font-medium text-gray-700 group-hover:border-sidebar-600 group-hover:text-sidebar-600',
							label: $t('sidebar', 'bugReport')
						})}
					</ul>
				</li>
				<!-- {@render TeamWidgetDesktop()} -->
				<OrganizationWidget {sidePanel} />
			</ul>
		</nav>
	</div>
</div>
