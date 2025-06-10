import dayjs from 'dayjs';

export function eventFormater(seance, patient) {
	console.log('seance', seance);
	console.log('patient', patient);
	const dateStr = dayjs(seance.date).format('YYYY-MM-DD');
	let start = dayjs(dateStr + ' ' + seance.start);
	console.log('start', start);

	let end = start
		.add(seance.metadata?.duree_custom || seance?.minutes || seance.duree_custom || 0, 'minute')
		.format('YYYY-MM-DD HH:mm');
	const event = {
		id: seance.seance_id,
		start: `${dateStr} ${seance.start}`,
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
}
