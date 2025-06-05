<script>
	import { t } from '../../lib/i18n';
	import PageTitle from '../../lib/cloud/components/layout/PageTitle.svelte';
	import EmptyState from '../../lib/components/EmptyState.svelte';
	import { calendarIcon, cogIcon, euroIcon, userIcon } from '../../lib/ui/svgs/IconSnippets.svelte';
	import { goto } from '$app/navigation';
	import ActionRapide from '../../lib/cloud/components/layout/ActionRapide.svelte';

	let { data } = $props();
</script>

<PageTitle titre={$t('sidebar', 'dashboard')} />

<!-- On peut aussi créer un raccourci à "Nouveau patient" -->

{#if data.noPatientYet}
	<EmptyState
		icon={userIcon}
		className="mt-20"
		titre="Vous n'avez pas encore créé de patients"
		description="Commencez par créer votre premier patient"
		onclick={() => {
			goto('/dashboard/patients/create');
		}}
		buttonText="Patient" />
{:else}
	<ActionRapide
		actionRapides={[
			{
				icon: userIcon,
				titre: 'Nouveau patient',
				description: 'Créez un nouveau patient',
				href: '/dashboard/patients/create',
				className: 'bg-pink-500 text-white'
			},
			{
				icon: euroIcon,
				titre: `Vous avez ${data.total} séances à facturer`,
				description: "Accédez à l'onglet finance pour produire vos attestations et factures",
				href: '/dashboard/finances',
				className: 'bg-yellow-500 text-white'
			},
			{
				icon: cogIcon,
				titre: 'Paramètres',
				description: 'Gérez vos paramètres de compte',
				href: '/dashboard/settings',
				className: 'bg-blue-500 text-white'
			},
			{
				icon: calendarIcon,
				titre: 'Consultez vos rendez-vous',
				description: "Accédez à l'onglet agenda pour consulter vos rendez-vous",
				href: '/dashboard/agenda',
				className: 'bg-green-500 text-white'
			}
		]} />
	<!-- <div class="mt-6 flex">
		<a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
			Or start from an empty project
			<span aria-hidden="true"> &rarr;</span>
		</a>
	</div> -->
{/if}
