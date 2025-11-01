<script>
	import { getTarifs } from '../../../../components/forms/utils/tarifHelpers';
	import { appState } from '../../../../managers/AppState.svelte';
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

	let profilOnBoardingItem = (missings) => ({
		icon: userIcon,
		color: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
		title: 'Compléter votre profil',
		description: `Assurez-vous que votre profil est complet pour une expérience optimale. (manquant${missings.length > 1 ? 's' : ''} : ${missings.join(', ')})`,
		href: '/dashboard/settings/profil',
		state: 'yet-to-be-completed'
	});
	const tarifOnBoardingItem = {
		icon: euroIcon,
		color: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
		title: 'Define your tarifs',
		description: 'Set up your tarifs and supplements for services offered.',
		href: '/dashboard/finances/tarifs-form',
		state: 'yet-to-be-completed'
	};
	const printerOnBoardingItem = {
		icon: printerIcon,
		color: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
		title: 'Set up your printer',
		description: 'Configure your printer for printing invoices and documents.',
		href: '/dashboard/settings/devices',
		state: 'yet-to-be-completed'
	};

	let isSetupGood = new Promise(async (resolve) => {
		let onBoardingWidgets = [];
		const profil = appState.has_complete_profile();
		if (profil.missings.length > 0) {
			onBoardingWidgets.push(profilOnBoardingItem(profil.missings));
		}

		let { data: printer } = await appState.db.getRawPrinter();
		if (!printer) {
			onBoardingWidgets.push(printerOnBoardingItem);
		}
		if (appState.user.conventionne) return resolve(onBoardingWidgets);

		let tarifs = await getTarifs();
		if (
			!tarifs.tarif_seance &&
			!tarifs.tarif_indemnite &&
			!tarifs.tarif_rapport_ecrit &&
			!tarifs.tarif_consultatif &&
			!tarifs.tarif_seconde_seance &&
			!tarifs.tarif_intake &&
			!tarifs.tarif_no_show
		) {
			onBoardingWidgets.push(tarifOnBoardingItem);
		}
		console.log('the onBoardingWidgets', onBoardingWidgets);

		resolve(onBoardingWidgets);
	});
</script>

{#await isSetupGood then onBoardingWidgets}
	<!-- C'est un peu moche mais c'est ce que Javasript autorise pour faire du confitionnal pushing on an array construction -->
	{#if onBoardingWidgets.length > 0}
		<div class="mt-10 border-b border-gray-200 pb-5 dark:border-white/10">
			<h3 class="text-base font-semibold text-gray-900 dark:text-white">
				Configruration de Kiné Helper
			</h3>
		</div>

		<div
			class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:grid sm:grid-cols-2 sm:divide-y-0 dark:divide-white/10 dark:bg-gray-900 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/20">
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
	{/if}
{/await}
