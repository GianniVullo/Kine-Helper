<script>
	import { t } from '../../lib/i18n';
	import { LocalDatabase } from '../../lib/stores/databaseInitializer';
	import { patients } from '../../lib/stores/PatientStore';
	import dayjs from 'dayjs';
	import { appState } from '../../lib/managers/AppState.svelte';
	import PageTitle from '../../lib/cloud/components/layout/PageTitle.svelte';
	import EmptyState from '../../lib/components/EmptyState.svelte';
	import {
		calendarIcon,
		cogIcon,
		euroIcon,
		user,
		userIcon
	} from '../../lib/ui/svgs/IconSnippets.svelte';
	import { goto } from '$app/navigation';
	import { create } from '@tauri-apps/plugin-fs';

	let { data } = $props();

	function getTodaysAppointments() {
		// let today = "date('now')";
		let today = `date('${dayjs().add(1, 'day').format('YYYY-MM-DD')}')`;
		return new Promise(async (resolve) => {
			let db = new LocalDatabase();
			console.log('today', today);
			const data = await db.select(
				`SELECT * FROM seances WHERE date(date) = ${today} AND user_id = $1`,
				[appState.user.id]
			);
			console.log('data', data);
			data.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
			resolve(
				data.map((seance) => {
					return {
						patient: $patients.find((patient) => patient.patient_id === seance.patient_id),
						seance
					};
				})
			);
		});
	}
	let actionRapides = [
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
	];
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
	<h2 class="mt-20 text-base font-semibold text-gray-900">Actions rapides</h2>
	<p class="mt-1 text-sm text-gray-500">
		Utilisez les actions rapides ci-dessous pour démarrer rapidement votre session.
	</p>
	<ul role="list" class="mt-6 divide-y divide-gray-200 border-t border-b border-gray-200">
		{#each actionRapides as { icon, titre, description, href, onclick, className }}
			<li>
				<div class="group relative flex items-start space-x-3 py-4">
					<div class="shrink-0">
						<span class={['inline-flex size-10 items-center justify-center rounded-lg', className]}>
							{@render icon('size-6 text-white')}
						</span>
					</div>
					<div class="min-w-0 flex-1">
						<div class="text-sm font-medium text-gray-900">
							{#if onclick}
								<button {onclick}>{titre}</button>
							{:else}
								<a {href}>
									<span class="absolute inset-0" aria-hidden="true"></span>
									{titre}
								</a>
							{/if}
						</div>
						<p class="text-sm text-gray-500">{description}</p>
					</div>
					<div class="shrink-0 self-center">
						<svg
							class="size-5 text-gray-400 group-hover:text-gray-500"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
							data-slot="icon">
							<path
								fill-rule="evenodd"
								d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
								clip-rule="evenodd" />
						</svg>
					</div>
				</div>
			</li>
		{/each}
	</ul>
	<!-- <div class="mt-6 flex">
		<a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
			Or start from an empty project
			<span aria-hidden="true"> &rarr;</span>
		</a>
	</div> -->
{/if}
