<script>
	import Dropdown from './Dropdown.svelte';

	import { supabase } from '$lib/index';
	import { page } from '$app/stores';
	import { PlusIcon } from '$lib/ui/svgs/index';
	import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import { NomenclatureManager } from '../../../../../../lib/utils/nomenclatureManager';
	import EventCalendar from '../../../../../../lib/EventCalendar.svelte';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let patient = getContext('patient');
	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === $page.params.spId);
	// Il nous faut un duration guesser pour pouvoir extrapoler la durée de la séance dans l'agenda
	let seanceGesser = new NomenclatureManager();

	async function getSeances() {
		let events = [];
		let durations = await seanceGesser.durationGuesser(sp.seances);
		for (let index = 0; index < sp.seances.length; index++) {
			const seance = sp.seances[index];
			let duration = durations[index];
			let daysjs_end = dayjs(seance.date);
			let seance_end = daysjs_end.add(duration, 'minute').format('YYYY-MM-DD HH:mm');
			events.push({
				id: seance.seance_id,
				// resourceIds: '',
				// allDay: false,
				start: daysjs_end.format('YYYY-MM-DD HH:mm'),
				end: seance_end,
				title: patient.nom + ' ' + patient.prenom,
				editable: false,
				startEditable: false,
				durationEditable: false,
				backgroundColor: 'rgb(168,85,247)',
				textColor: '#dbdee9'
				// extendedProps: ''
			});
		}
		console.log('the events from getSeances', events);
		return events;
	}

	let ec;
	// ec.setOption()
	console.log('la situation pathologique :', sp);

	let comboboxValue;

	const popupCombobox = {
		event: 'click',
		target: 'popupCombobox',
		placement: 'bottom',
		closeQuery: '.listbox-item'
	};

	let items = [
		{ name: 'Attestation', href: $page.url.pathname + '/attestations/create' },
		{ name: 'Prescription', href: $page.url.pathname + '/prescriptions/create' },
		{ name: 'Document', href: 'movies' },
		{ name: 'Générateur', href: 'television' },
		{ name: 'Séance', href: 'movies' }
	];
	const modalStore = getModalStore()
	const modal = {
		modalClasses: "border-success-500 border-2",
		type: 'component',
		component: 'attestationCreation',
		// Populates the input value and attributes
		meta: {seances: sp?.seances, patient: patient, sp: sp},
		// Returns the updated response value
		response: (r) => console.log('response:', r)
	};
</script>

<div class="mx-4 flex w-full flex-col">
	<!--* Titre -->
	<div class="flex flex-col">
		<h5 class="text-lg text-surface-500 dark:text-surface-400">
			Situation pathologique du {dayjs(sp.created_at).format('DD/MM/YYYY')}
		</h5>
		<div class="flex flex-wrap space-x-2">
			{#each items as item}
				<a href={item.href} class="variant-outline-secondary btn btn-sm my-2 flex">
					<PlusIcon class="h-4 w-4 stroke-surface-600 dark:stroke-surface-300" />
					<span class="text-sm text-surface-500 dark:text-surface-400">{item.name}</span></a>
			{/each}
		</div>
	</div>

	<!--* Motif de la situation pathologique -->
	<div>
		<div class="relative flex rounded-xl bg-surface-100 px-4 pb-4 pt-8 dark:bg-surface-800">
			<p class="absolute left-4 top-1 text-sm text-surface-700 dark:text-surface-400">Motif</p>
			<p class="text-base text-surface-700 dark:text-surface-300">{sp.motif}</p>
		</div>
	</div>

	<!--* Séances Agenda -->
	<div class="mt-4 flex w-[90%] flex-col">
		<h5 class="mb-2 text-lg text-surface-500 dark:text-surface-400">Séances</h5>
		{#key sp}
			{#await getSeances() then value}
				<EventCalendar bind:this={ec} events={value} options={{}} />
			{:catch error}
				ça merde ! {error}
			{/await}
		{/key}
	</div>
	<div>
		<ul>
			Que veux-t-on pouvoir faire ?
			<li>- Ajouter des séances</li>
			<li>- Au travers d'un générateur</li>
			<li>- Directement sur l'agenda</li>
			<li>- Afficher les documents</li>
			<li>- Afficher</li>
			Agenda avec des séances et des contrôles directement sur les séances
		</ul>
	</div>
</div>
