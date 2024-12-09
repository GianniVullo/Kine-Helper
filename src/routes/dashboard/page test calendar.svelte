<script>
	import { locale, t } from '../../lib/i18n';
	import { LocalDatabase } from '../../lib/stores/databaseInitializer';
	import { dev } from '$app/environment';
	import { user } from '../../lib/stores/UserStore';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { patients } from '../../lib/stores/PatientStore';
	import { get, writable } from 'svelte/store';
	import dayjs from 'dayjs';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { fetch } from '@tauri-apps/plugin-http';
	import { open } from '@tauri-apps/plugin-shell';
	import { invoke } from '@tauri-apps/api/core';
	import { getMainKey } from '../../lib/stores/strongHold';
	import Calendar from '@event-calendar/core';
	import TimeGrid from '../../lib/calendar-vkurko/timeGrid';

	const modalStore = getModalStore();

	let plugins = [TimeGrid];
	let options = {
		view: 'timeGridWeek',
		firstDay: 1,
		events: [
			{
				id: 'event-001',
				resourceIds: ['resource-1', 'resource-2'],
				allDay: false,
				start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 1)), // Monday
				end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 1, 10)), // Monday + 2 hours
				title: 'Team Meeting',
				editable: true,
				startEditable: true,
				durationEditable: true,
				display: 'auto',
				backgroundColor: '#ff5733',
				textColor: '#ffffff',
				classNames: ['team-meeting', 'highlight'],
				styles: [{ fontWeight: 'bold' }],
				extendedProps: {
					description: 'Weekly team sync-up meeting',
					location: 'Conference Room A'
				}
			},
			{
				id: 'event-002',
				resourceIds: ['resource-3'],
				allDay: true,
				start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 3)), // Wednesday
				end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 3)), // Wednesday
				title: 'Project Deadline',
				editable: false,
				startEditable: false,
				durationEditable: false,
				display: 'background',
				backgroundColor: '#28a745',
				textColor: '#000000',
				classNames: ['project-deadline'],
				styles: [{ opacity: '0.8' }],
				extendedProps: {
					description: 'Final submission of the project',
					priority: 'High'
				}
			},
			{
				id: 'event-003',
				resourceIds: ['resource-1', 'resource-4'],
				allDay: false,
				start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 5, 9)), // Friday at 9 AM
				end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 5, 11)), // Friday at 11 AM
				title: 'Client Presentation',
				editable: true,
				startEditable: true,
				durationEditable: false,
				display: 'auto',
				backgroundColor: '#ffc107',
				textColor: '#212529',
				classNames: ['client-presentation', 'important'],
				styles: [{ border: '2px solid #ff0000' }],
				extendedProps: {
					client: 'Acme Corp',
					location: 'Virtual (Zoom)'
				}
			},
			{
				id: 'event-004',
				resourceIds: ['resource-5'],
				allDay: false,
				start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 6, 14)), // Saturday at 2 PM
				end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 6, 16)), // Saturday at 4 PM
				title: 'Code Review Session',
				editable: true,
				startEditable: true,
				durationEditable: true,
				display: 'auto',
				backgroundColor: '#17a2b8',
				textColor: '#ffffff',
				classNames: ['code-review', 'development'],
				styles: [{ fontStyle: 'italic' }],
				extendedProps: {
					description: 'Review recent code commits',
					team: 'Backend Team'
				}
			},
			{
				id: 'event-005',
				resourceIds: ['resource-2'],
				allDay: true,
				start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 7)), // Sunday
				end: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() - 7)), // Sunday
				title: 'Maintenance Window',
				editable: false,
				startEditable: false,
				durationEditable: false,
				display: 'background',
				backgroundColor: '#dc3545',
				textColor: '#ffffff',
				classNames: ['maintenance-window'],
				styles: [{ opacity: '0.5' }],
				extendedProps: {
					description: 'Scheduled server maintenance',
					downtime: '2 hours'
				}
			}
		]
	};

	function getTodaysAppointments() {
		// let today = "date('now')";
		let today = `date('${dayjs().add(1, 'day').format('YYYY-MM-DD')}')`;
		return new Promise(async (resolve) => {
			let db = new LocalDatabase();
			console.log('today', today);
			const data = await db.select(
				`SELECT * FROM seances WHERE date(date) = ${today} AND user_id = $1`,
				[$user.user.id]
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
	// let marketingPromise;
	// let interval;
	// let currentIndex = writable(0);
	// let urlSource;
	// function rotatingAds(node) {
	// 	marketingPromise = new Promise(async (resolve, reject) => {
	// 		let response = await fetch(
	// 			`https://admin-console.kine-helper.be/api/get-ads?lang=${get(locale).toLowerCase()}`
	// 		);
	// 		response = await response.json();
	// 		interval = setInterval(() => {
	// 			if ($currentIndex === response.length - 1) {
	// 				currentIndex.set(0);
	// 			} else {
	// 				currentIndex.update((n) => {
	// 					return n + 1;
	// 				});
	// 			}
	// 		}, 12000);
	// 		console.log('THE RESPONSE', response);
	// 		return resolve(response);
	// 	});
	// 	return {
	// 		destroy() {
	// 			clearInterval(interval);
	// 		}
	// 	};
	// }
</script>

<Calendar {plugins} {options} />
<main class="flex h-[80vh] w-full flex-col">
	<header class="flex basis-1/12 flex-col">
		<h1 class="text-xl text-surface-400">{$t('sidebar', 'dashboard')}</h1>
		<p>
			{$t('dashboard', 'description')}
		</p>
	</header>
	{#if dev}
		<div class=""><a class="variant-filled btn" href="/dashboard/debug">DEBUG</a></div>
	{/if}
	<article class="flex h-full w-full">
		<section class="relative my-4 flex basis-10/12 flex-col rounded-xl p-4">
			<h2 class="absolute left-1 top-1 text-sm text-surface-400">
				{$t('dashboard', 'infos')}
			</h2>
			<div class="mt-4 flex h-[70%] basis-1/2">
				<div
					class="relative flex basis-1/4 overflow-y-scroll rounded-lg border border-surface-500 bg-white/50 p-2 shadow-inner dark:bg-black/20">
					<h3 class="absolute left-1 top-1 text-sm text-surface-400">
						{$t('dashboard', 'todaysAppointment')} ({$t('dashboard', 'featureComingSoon')})
					</h3>
					<div class="mt-4 flex flex-col">
						<!-- {#await getTodaysAppointments()}
							{$t('shared', 'loading')}
						{:then seances}
							{#if seances.length === 0}
								{$t('dashboard', 'todayEmpty')}
							{:else}
								<div class="mt-2 flex flex-col space-y-2">
									{#each seances as { patient, seance }}
										<button
											on:click={() => {
												modalStore.trigger({
													type: 'component',
													component: 'calendarEvent',
													meta: {
														event: { extendedProps: { seance } }
													}
												});
											}}
											class="flex w-full items-start justify-start rounded-lg border border-surface-900 bg-secondary-500/10 px-2 py-1 shadow duration-200 hover:scale-105 dark:bg-secondary-900/50">
											<h5 class="w-60 truncate text-left">
												{dayjs(seance.date).format('HH:mm')}
												{patient.nom + ' ' + patient.prenom}
											</h5>
										</button>
									{/each}
								</div>
							{/if}
						{/await} -->
					</div>
				</div>
				<div class="flex basis-3/4">
					<div
						class="relative mx-1 flex w-full basis-1/2 overflow-y-scroll rounded-lg border border-surface-500 bg-white/50 p-2 shadow-inner dark:bg-black/20">
						<h3 class="absolute left-1 top-1 text-sm text-surface-400">
							{$t('dashboard', 'unpaidAttest')}
							({$t('dashboard', 'featureComingSoon')})
						</h3>
						<div class="mt-4 flex w-full flex-col items-start space-y-1 p-2"></div>
					</div>
					<div
						class="relative mx-1 flex w-full basis-1/2 overflow-y-scroll rounded-lg border border-surface-500 bg-white/50 p-2 shadow-inner dark:bg-black/20">
						<h3 class="absolute left-1 top-1 text-sm text-surface-400">
							{$t('dashboard', 'community')} ({$t('dashboard', 'projectComingSoon')})
						</h3>
						<div class="mt-4 flex w-full flex-col items-start space-y-1 p-2">
							{$t('dashboard', 'communityDescription')}
						</div>
					</div>
				</div>
			</div>
			<div
				class="relative mt-2 flex h-[30%] basis-1/2 flex-col rounded-lg border border-surface-500 bg-white/50 px-2 pb-2 pt-6 shadow-inner dark:bg-black/20">
				<h3 class="absolute left-1 top-1 text-sm text-surface-400">
					{$t('dashboard', 'ads')}
				</h3>
				<div class="relative mt-4 flex w-full snap-x overflow-x-scroll">
					<div class="mt-4 flex flex-col space-y-4">
						<p class="">
							{$t('dashboard', 'adsDescription')}
						</p>

						<!-- {#await marketingPromise then ads}
						{#if ads}
							<div class="">
								<img
									class="h-auto max-w-[600px]"
									src={`https://admin-console.kine-helper.be/api/get-img?id=${
										ads[$currentIndex]?.id
									}&lang=${$locale.toLowerCase()}`}
									alt="" />
								<button
									on:click={() => {
										modalStore.trigger({
											type: 'component',
											component: 'marketingModal',
											meta: { pub: ads[$currentIndex] }
										});
									}}
									class="variant-filled-primary btn btn-sm bottom-0 left-0 mt-2"
									>{$t('otherModal', 'more', null, 'En savoir plus')}</button>
								<button
									on:click={async () => {
										await open(ads[$currentIndex]?.landing_page_url);
									}}
									class="variant-filled-primary btn btn-sm bottom-0 left-0 mt-2"
									>{$t('otherModal', 'ourOffer', null, 'Consulter nos offres')}</button>
							</div>
						{/if}
					{/await} -->
					</div>
				</div>
			</div>
		</section>
		<section
			class="relative mx-1 my-4 basis-2/12 rounded-xl border border-secondary-500 bg-white/50 p-4 shadow-inner dark:bg-black/20">
			<h3 class="absolute left-1 top-1 text-sm text-surface-400">
				{$t('dashboard', 'logs')} ({$t('dashboard', 'featureComingSoon')})
			</h3>
			<p class="mt-8">
				{$t('dashboard', 'logsDescription')}
			</p>
		</section>
	</article>
</main>
