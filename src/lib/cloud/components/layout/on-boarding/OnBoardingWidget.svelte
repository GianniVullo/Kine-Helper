<script>
	import { euroIcon, printerIcon, userIcon } from '../../../../ui/svgs/IconSnippets.svelte';
	/**
	 * Here we need to invite the user to complete the steps for the app to work optimally.
	 * This includes:
	 * - Setting up complete user profile
	 * - Setting up external peripherics (e.g. printers, cameras)
	 * - Setting up tarifs and supplements
	 * - Setting up external services (e.g. payment gateways, email services)
	 */
	import Section from './Section.svelte';
	let onBoardingWidgets = [
		{
			icon: userIcon,
			color: 'bg-teal-50 text-teal-700',
			title: 'Compléter votre profil',
			description: 'Assurez-vous que votre profil est complet pour une expérience optimale.',
			href: '/dashboard/settings#profile',
			state: 'yet-to-be-completed'
		},
		{
			icon: printerIcon,
			color: 'bg-purple-50 text-purple-700',
			title: 'Set up your printer',
			description: 'Configure your printer for printing invoices and documents.',
			href: '/dashboard/settings/printer',
			state: 'yet-to-be-completed'
		},
		{
			icon: euroIcon,
			color: 'bg-sky-50 text-sky-700',
			title: 'Define your tarifs',
			description: 'Set up your tarifs and supplements for services offered.',
			href: '/dashboard/settings/tarifs',
			state: 'yet-to-be-completed'
		}
	];
</script>

<div
	class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
	{#each onBoardingWidgets as widget, index}
		<Section
			icon={widget.icon}
			color={widget.color}
			href={widget.href}
			onclick={() => goto(widget.href)}
			title={widget.title}
			description={widget.description}
			state={widget.state} />
	{/each}
</div>
