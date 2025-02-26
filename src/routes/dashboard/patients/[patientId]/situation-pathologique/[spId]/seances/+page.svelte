<script>
	import { t } from '../../../../../../../lib/i18n';
	import EventCalendar from '../../../../../../../lib/EventCalendar.svelte';
	import { getEvents } from '../eventFigureOuter';

	let { data } = $props();
	let { patient, sp } = data;

	let eventsSource = new Promise(async (resolve) => {
		console.log('sp', sp);
		//! temporary solution as It seems that whatever I try it keeps on failing from time to time
		try {
			let events = await getEvents(patient, sp);
			resolve(events);
		} catch (error) {
			let events = await getEvents(patient, sp);
			resolve(events);
		}
	});
	let ec;
</script>

<a
	class="btn variant-form-material"
	href={'/dashboard/patients/' +
		patient.patient_id +
		'/situation-pathologique/' +
		sp.sp_id +
		'/seances/create'}>Ajouter une nouvelle séance</a>

{#if sp.seances.length > 0}
	<!--* Séances Agenda -->
	<div class="mt-4 flex w-[90%] flex-col">
		<h5 class="mb-2 text-lg text-surface-500 dark:text-surface-400">
			{$t('patients.detail', 'prestations')} ({sp.seances.length})
		</h5>
		{#key eventsSource}
			{#await eventsSource}
				{$t('shared', 'loading')}
			{:then events}
				<EventCalendar bind:this={ec} {events} options={{}} />
			{/await}
		{/key}
		<!-- {/key} -->
		<!-- {:else}
				{$t('shared', 'loading')}
			{/if}
		{/await}
	{/key} -->
	</div>
{/if}

<!--* ok donc mtn on a enfin notre architecture de construite -->
<!--* Il faut maintenant un manipulateur de séance qui permet de gérer les mouvements des prestations au sein d'une sp  -->

<!-- <section class="h-[80vh]">
	{#await codes}
		Chargement des codes
	{:then value}
		<h1>
			This page is here, at the moment, only to allow me to debug my new "algorithms". Who knows,
			soon enough will here be some usefull functionnality to help us manage our sessions!
		</h1>
		<div class="flex flex-col">
			<div class="flex items-center justify-start">
				{#each [...nomenclature.architecture(value.data)[0], ...nomenclature.architecture(value.data)[1]] as code, idx}
					<div
						class="relative flex min-h-20 min-w-60 flex-col border border-rose-50 bg-secondary-500 py-3">
						<p class="absolute right-1 top-1">{idx + 1}</p>

						<h5>{code.code_reference}</h5>
					</div>
				{/each}
			</div>
			<div class="flex">
				{#each sp.seances as seance, i}
					<div class="flex min-h-20 min-w-60 flex-col border border-rose-50 bg-surface-500 py-3">

						<h5>{dayjs(seance.date).format('DD/MM/YYYY')}</h5>
						{#await new Promise(async (resolve) => {
							let db = new LocalDatabase();
							let code = await db.select( 'SELECT * FROM codes WHERE code_id = $1', [seance.code_id] );
							console.log(code);
							resolve(code[0]);
						}) then code}
							{code.code_reference}
						{/await}
					</div>
					<div class="size-28 bg-surface-400"></div>
				{/each}
			</div>
		</div>
	{/await}
</section> -->
