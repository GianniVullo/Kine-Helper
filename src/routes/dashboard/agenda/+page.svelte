<script>
	import { t } from '../../../lib/i18n';
	import PageTitle from '../../../lib/cloud/components/layout/PageTitle.svelte';
	import EventCalendar from '../../../lib/EventCalendar.svelte';
	import { eventFormater } from '../../../lib/utils/calendarEventFormater';
	import { pushState } from '$app/navigation';
	import { supabase } from '../../../lib/stores/supabaseClient';

	let ec = $state();

	const modal = (info) => {
		pushState('', {
			modal: {
				title: $t(
					'agenda',
					'sessionFor',
					{ patientName: info.event.title },
					`Session for ${info.event.title}`
				),
				buttonTextConfirm: $t('agenda', 'viewSP', {}, 'View pathological situation'),
				href: `/dashboard/patients/${info.event.extendedProps.seance.patient_id}/situation-pathologique/${info.event.extendedProps.seance.sp_id}`,
				event: info.event
			}
		});
	};

	const eventCache = new Map();

	function getCacheKey(startStr, endStr) {
		return `${startStr}_${endStr}`;
	}
</script>

<PageTitle titre={$t('sidebar', 'agenda', {}, 'Agenda')} />
<div class="mt-12">
	<EventCalendar
		bind:ec
		eventSources={[
			{
				events(fetchInfo, successCallback, failureCallback) {
					console.log('In the events list function', fetchInfo);
					return new Promise(async (resolve, reject) => {
						const cacheKey = getCacheKey(fetchInfo.startStr, fetchInfo.endStr);

						if (eventCache.has(cacheKey)) {
							console.log('Using cached data');
							resolve(eventCache.get(cacheKey));
							return;
						}
						const { data, error } = await supabase
							.from('seances')
							.select('*, patients!seances_patient_id_fkey(nom, prenom)')
							.gte('date', fetchInfo.startStr)
							.lt('date', fetchInfo.endStr);
						if (error) {
							reject(error);
						} else {
							const formatedEvents = data.map((v) => eventFormater(v, v.patients));
							eventCache.set(cacheKey, formatedEvents);
							resolve(formatedEvents);
						}
						return;
					});
				}
			}
		]}
		options={{
			eventClick(info) {
				console.log('eventClick', info);
				modal(info);
			},
			loading(info) {
				console.log('loading', info);
			}
		}} />
</div>
