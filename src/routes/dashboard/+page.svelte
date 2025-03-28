<script>
	import { t } from '../../lib/i18n';
	import { LocalDatabase } from '../../lib/stores/databaseInitializer';
	import { dev } from '$app/environment';
	import { patients } from '../../lib/stores/PatientStore';
	import dayjs from 'dayjs';
	import { appState } from '../../lib/managers/AppState.svelte';


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
</script>

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
