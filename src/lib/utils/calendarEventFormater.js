import dayjs from 'dayjs';

export function eventFormater(
	seance,
	patient,
	options = { editable: false, startEditable: false, durationEditable: false }
) {
	// console.log('seance', seance);
	// console.log('patient', patient);
	const dateStr = dayjs(seance.date).format('YYYY-MM-DD');
	let start;
	if (!seance.start) {
		start = dayjs(seance.date);
	} else {
		start = dayjs(dateStr + ' ' + seance.start);
	}
	// console.log('start', start);

	let end = start
		.add(seance.metadata?.duree_custom || seance?.minutes || seance.duree_custom || 0, 'minute')
		.format('YYYY-MM-DD HH:mm');
	const event = {
		id: seance.seance_id,
		start: `${dateStr} ${seance.start}`,
		end: end,
		backgroundColor: 'oklch(97.7% 0.014 308.299)',
		textColor: 'oklch(49.6% 0.265 301.924)',
		title: patient.nom + ' ' + (patient?.prenom?.substring(0, 1) + '.' ?? ''),
		extendedProps: {
			seance: seance
		},
		...options
	};
	// console.log('event', event);
	return event;
}
