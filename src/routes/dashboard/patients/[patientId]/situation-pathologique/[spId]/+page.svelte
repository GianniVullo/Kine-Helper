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

	export let data;
	let seanceGesser = new NomenclatureManager();

	async function getSeances() {
		let events = [];
		let durations = await seanceGesser.durationGuesser(data.sp.seances);
		for (let index = 0; index < data.sp.seances.length; index++) {
			const seance = data.sp.seances[index];
			let duration = durations[index];
			let daysjs_end = dayjs(seance.date);
			let seance_end = daysjs_end.add(duration, 'minute').format('YYYY-MM-DD HH:mm');
			events.push({
				id: seance.seance_id,
				// resourceIds: '',
				// allDay: false,
				start: daysjs_end.format('YYYY-MM-DD HH:mm'),
				end: seance_end,
				title: data.patient.nom + ' ' + data.patient.prenom,
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
	console.log('la situation pathologique :', data);

	let comboboxValue;

	const popupCombobox = {
		event: 'click',
		target: 'popupCombobox',
		placement: 'bottom',
		closeQuery: '.listbox-item'
	};

	let items = [
		{ name: 'Attestation', href: $page.url.pathname + '/attestations/create' },
		// { name: 'Prescription', href: $page.url.pathname + '/prescriptions/create' },
		{ name: 'Document', href: 'movies' },
		// { name: 'Générateur', href: 'television' },
		{ name: 'Séances', href: 'movies' }
	];
</script>

<div class="mx-4 flex w-full flex-col">
	<!--* Titre -->
	<div class="flex flex-col">
		<h5 class="text-lg text-surface-500 dark:text-surface-400">
			Situation pathologique du {dayjs(data.sp.created_at).format('DD/MM/YYYY')}
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
			<p class="text-base text-surface-700 dark:text-surface-300">{data.sp.motif}</p>
		</div>
	</div>

	<!--* Séances Agenda -->
	<div class="mt-4 flex w-[90%] flex-col">
		<h5 class="mb-2 text-lg text-surface-500 dark:text-surface-400">Séances</h5>
		{#key data}
			<EventCalendar bind:this={ec} events={data.events} options={{}} />
		{/key}
	</div>
</div>
