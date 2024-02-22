import { NomenclatureManager } from '$lib/utils/nomenclatureManager';
import dayjs from 'dayjs';

export async function getEvents(patient, sp) {
	if (sp.seances.lenth === 0) {
		return { sp, events: [] };
	}

	let nomenclatureManager = new NomenclatureManager();
	let events = [];
	let durations = await nomenclatureManager.durationGuesser(sp.seances);
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
			textColor: '#dbdee9',
			extendedProps: {
				seance: seance
			}
		});
	}
	console.log('the events from getSeances', events);

	return events;
}
