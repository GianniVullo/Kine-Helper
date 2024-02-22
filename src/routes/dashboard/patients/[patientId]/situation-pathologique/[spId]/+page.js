// /** @type {import('./$types').PageLoad} */
// export async function load({ parent, params }) {
// 	console.log('the params from getSeances', params);
// 	const { patient } = await parent();
// 	console.log('the patient from getSeances', patient);
// 	let sp = patient.situations_pathologiques.find((sp) => sp.sp_id === params.spId);
// 	console.log('the sp from getSeances', sp);
// 	// Il nous faut un duration guesser pour pouvoir extrapoler la durée de la séance dans l'agenda
// 	if (sp.seances.lenth === 0) {
// 		return { sp, events: [] };
// 	}

// 	let nomenclatureManager = new NomenclatureManager();
// 	let events = [];
// 	let durations = await nomenclatureManager.durationGuesser(sp.seances);
// 	for (let index = 0; index < sp.seances.length; index++) {
// 		const seance = sp.seances[index];
// 		let duration = durations[index];
// 		let daysjs_end = dayjs(seance.date);
// 		let seance_end = daysjs_end.add(duration, 'minute').format('YYYY-MM-DD HH:mm');
// 		events.push({
// 			id: seance.seance_id,
// 			// resourceIds: '',
// 			// allDay: false,
// 			start: daysjs_end.format('YYYY-MM-DD HH:mm'),
// 			end: seance_end,
// 			title: patient.nom + ' ' + patient.prenom,
// 			editable: false,
// 			startEditable: false,
// 			durationEditable: false,
// 			backgroundColor: 'rgb(168,85,247)',
// 			textColor: '#dbdee9',
// 			extendedProps: {
// 				seance: seance,
// 			}
// 		});
// 	}
// 	console.log('the events from getSeances', events);

// 	return { sp, events };
// }

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [{ patientId: 'test-patient', spId: '0b017e35-2b9a-4462-8723-fa2740af5ca2' }];
}
