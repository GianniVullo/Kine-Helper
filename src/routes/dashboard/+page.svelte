<script>
	import { t } from '../../lib/i18n';
	import PageTitle from '../../lib/cloud/components/layout/PageTitle.svelte';
	import EmptyState from '../../lib/components/EmptyState.svelte';
	import { calendarIcon, cogIcon, euroIcon, userIcon } from '../../lib/ui/svgs/IconSnippets.svelte';
	import { goto } from '$app/navigation';
	import ActionRapide from '../../lib/cloud/components/layout/ActionRapide.svelte';
	import OnBoardingWidget from '../../lib/cloud/components/layout/on-boarding/OnBoardingWidget.svelte';

	let { data } = $props();

	const i18ndict = {
		dashboard: {
			actions: {
				newPatient: {
					title: 'Nouveau patient',
					description: 'Créez un nouveau patient'
				},
				billing: {
					title: 'Facturer',
					description: "Accédez à l'onglet finance pour produire vos attestations et factures"
				},
				settings: {
					title: 'Paramètres',
					description: 'Gérez vos paramètres de compte'
				},
				appointments: {
					title: 'Consultez vos rendez-vous',
					description: "Accédez à l'onglet agenda pour consulter vos rendez-vous"
				}
			},
			emptyState: {
				title: "Vous n'avez pas encore créé de patients",
				description: 'Commencez par créer votre premier patient',
				buttonText: 'Patient'
			}
		}
	};

	const actionRapides = [
		{
			icon: userIcon,
			titre: $t('dashboard', 'actions.newPatient.title', {}, 'Nouveau patient'),
			description: $t(
				'dashboard',
				'actions.newPatient.description',
				{},
				'Créez un nouveau patient'
			),
			href: '/dashboard/patients/create',
			className: 'bg-pink-500 text-white'
		},
		{
			icon: euroIcon,
			titre: $t('dashboard', 'actions.billing.title', {}, 'Facturer'),
			description: $t(
				'dashboard',
				'actions.billing.description',
				{},
				"Accédez à l'onglet finance pour produire vos attestations et factures"
			),
			href: '/dashboard/finances',
			className: 'bg-yellow-500 text-white'
		},
		{
			icon: cogIcon,
			titre: $t('dashboard', 'actions.settings.title', {}, 'Paramètres'),
			description: $t(
				'dashboard',
				'actions.settings.description',
				{},
				'Gérez vos paramètres de compte'
			),
			href: '/dashboard/settings',
			className: 'bg-blue-500 text-white'
		},
		{
			icon: calendarIcon,
			titre: $t('dashboard', 'actions.appointments.title', {}, 'Consultez vos rendez-vous'),
			description: $t(
				'dashboard',
				'actions.appointments.description',
				{},
				"Accédez à l'onglet agenda pour consulter vos rendez-vous"
			),
			href: '/dashboard/agenda',
			className: 'bg-green-500 text-white'
		}
	];
</script>

<PageTitle titre={$t('sidebar', 'dashboard')} />

<OnBoardingWidget />

<!-- On peut aussi créer un raccourci à "Nouveau patient" -->

{#if data.noPatientYet}
	<EmptyState
		icon={userIcon}
		className="mt-20"
		titre={$t('dashboard', 'emptyState.title', {}, "Vous n'avez pas encore créé de patients")}
		description={$t(
			'dashboard',
			'emptyState.description',
			{},
			'Commencez par créer votre premier patient'
		)}
		onclick={() => {
			goto('/dashboard/patients/create');
		}}
		buttonText={$t('dashboard', 'emptyState.buttonText', {}, 'Patient')} />
{:else}
	<ActionRapide {actionRapides} />
	<!-- <div class="mt-6 flex">
		<a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
			Or start from an empty project
			<span aria-hidden="true"> &rarr;</span>
		</a>
	</div> -->
{/if}
