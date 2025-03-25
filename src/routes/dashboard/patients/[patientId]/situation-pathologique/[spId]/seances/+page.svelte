<script>
	import { t } from '../../../../../../../lib/i18n';
	import dayjs from 'dayjs';
	import SectionTitle from '../../../../../../../lib/components/SectionTitle.svelte';
	import BoutonSecondaireAvecIcone from '../../../../../../../lib/components/BoutonSecondaireAvecIcone.svelte';
	import { addIcon, successIcon } from '../../../../../../../lib/ui/svgs/IconSnippets.svelte';
	import BoutonPrincipalAvecIcone from '../../../../../../../lib/components/BoutonPrincipalAvecIcone.svelte';
	import Select from '../../../../../../../lib/components/form/Select.svelte';
	import EventCalendar from '../../../../../../../lib/EventCalendar.svelte';
	import CardTable from '../../../../../../../lib/components/CardTable.svelte';
	import { toast } from '../../../../../../../lib/cloud/libraries/overlays/notificationUtilities.svelte';

	let { data } = $props();
	let { patient, sp } = data;

	let events = sp.seances.map((seance) => {
		let start = dayjs(seance.date);
		console.log('start', start);

		let end = start
			.add(seance.metadata?.duree_custom ?? seance.minutes, 'minute')
			.format('YYYY-MM-DD HH:mm');
		const event = {
			id: seance.seance_id,
			start: `${seance.date} ${seance.start}`,
			end: end,
			title: patient.nom + ' ' + (patient?.prenom ?? ''),
			editable: false,
			startEditable: false,
			durationEditable: false,
			extendedProps: {
				seance: seance
			}
		};
		console.log('event', event);
		return event;
	});

	let display = $state('calendar');
	let ec;
</script>

<SectionTitle titre="Séances" className="space-x-2">
	{#snippet actions()}
		<div class="flex items-center space-x-2">
			<Select id="affichage" bind:value={display}>
				{#snippet options()}
					<option class="text-xs" value="calendar">🗓️ Calendrier</option>
					<option class="text-xs" value="list">🗂️ Liste</option>
				{/snippet}
			</Select>
		</div>
		<!-- <BoutonSecondaireAvecIcone
			size="sm"
			href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create-bulk`}
			inner={'Séances multiples'}
			icon={addIcon} /> -->
		<BoutonPrincipalAvecIcone
			href={`/dashboard/patients/${patient.patient_id}/situation-pathologique/${sp.sp_id}/seances/create`}
			size="sm"
			className="ml-3 inline-flex items-center bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			inner="Séance"
			icon={addIcon} />
	{/snippet}
</SectionTitle>

{#if sp.seances.length > 0}
	<!--* Séances Agenda -->
	<div class="mt-4 flex w-[90%] flex-col">
		<EventCalendar bind:this={ec} {events} options={{}} />
	</div>
{:else}
	Pas de séances pour l'instant
{/if}
