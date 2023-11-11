import dayjs from 'dayjs';
import { supabase } from '../../../../stores/supabaseClient';
// DOOM File

//? Fonction générale permettant d'enregister ... Peut-être pas nécessaire
function generateSeance(values) {
	return new Promise((resolve) => {
		console.log('onSubmit with', values);
		let seances = seanceRepartitionLogic(values);
		console.log('seances', seances);
		supabase
			.from('seances')
			.insert(seances)
			.select()
			.then(({ data, error }) => {
				if (error) {
					throw new Error(error);
				}
				resetForm();
				resolve();
			});
	});
}

//? Ici on crée une liste de date en prenant en compte la date de la première séance, la quantité de séances à produire et les jours de la semaine à produire
//! Ajouter une possibilité de mettre des jours de congés 
function generateDates(start, amount, days_of_week) {
	console.log(
		'in generateDates',
		`Nombre de seances ${amount}`,
		'date première séance',
		start,
		'days of week :',
		days_of_week
	);
	let counter = (amount ?? 0) - 1;
	// (parce que ça commence à 0)
	console.log(`Compteur = ${counter}`);
	let dates = [start];
	for (var i = 1; counter > 0; i++) {
		let comparatingDate = start;
		let dateToAnalize = comparatingDate.add(i, 'd');
		if (days_of_week.includes(dateToAnalize.day())) {
			//! avec un and ici on peut ajouter les congés etc.
			dates.push(dateToAnalize);
			counter--;
		}
	}
	return dates;
}

//? Here is the heavy lifting : concretely putting toegether dates and séances
function seanceRepartitionLogic(values) {
	console.log('In seanceRepartitionLogic()');
	let seances = [];
	const store = useConventionStore();
	const adapter = store.groupes[values.groupe];
	for (const date of generateDates(
		dayjs(values.datePremiereSeance),
		values.n_seances - values.deja_faites,
		values.day_of_week
	)) {
		if (
			seances.length < // + int.parse(formData["deja_faite"] ?? '0' <= Pas nécessaire car les séances sont déjà enregistrées et validée par le fields seanceGenNbr
			adapter.seances_normales_executables(values.duree)
		) {
			seances.push(createAddSeance(date, store.codes, 0, values));
			// ICI Je pensais insérer les intakes et indemnité mais je me rends compte
			// que ces deux codes devraient être insérer lors de la création d'une
			// attestation car ils ne demandent aucuns contenus/Info addittionnelles
			// Je pensais aussi ajouter le rapport écrit mais il s'agit d'un élément
			// qui mériterait son propre objet avec ses widgets. A la place je vais le
			// générer avec l'objet Situation Pathologique.
		} else if (
			seances.length <
			adapter.seances_en_depassement_executables(values.duree) +
				adapter.seances_normales_executables(values.duree)
		) {
			seances.push(createAddSeance(date, store.codes, 1, values));
		} else if (
			seances.length <
			adapter.seances_normales_executables(values.duree) +
				adapter.seances_en_depassement_executables(values.duree) +
				adapter.seances_en_surdepassement_executables(values.duree)
		) {
			seances.push(createAddSeance(date, store.codes, 2, values));
		}
	}
	return seances;
}

function createAddSeance(date, codes, codeType, values) {
	console.log('in createAddSeance() for date :', date);
	let code = codes.find(
		(element) =>
			element.groupe == values.groupe &&
			element.type == codeType &&
			element.lieu == values.lieu &&
			element.pathologie == values.drainage &&
			element.duree == values.duree
	);
	console.log(code);
	// Ici il faut arranger l'heure du rendez-vous
	const dateDuRDV = dayjs(date);
	const jourDuRDV = day_in_week[dateDuRDV.day()];
	const rendezVousStart = dateDuRDV
		.set('hour', parseInt(values[jourDuRDV]['start'].split(':')[0]))
		.set('minute', parseInt(values[jourDuRDV]['start'].split(':')[1]));
	let rendezVousEnd = rendezVousStart.add(
		values[jourDuRDV]['end']
			? parseInt(values[jourDuRDV]['end'].split(':')[1])
			: all_duree[values.duree],
		'minute'
	);
	console.log(rendezVousStart.toDate());
	return {
		user_id: user.value.id,
		patient_id: props.sp.patient_id,
		sp_id: props.sp.sp_id,
		prescription_id: values.prescriptionId,
		code_id: code.code_id,
		description: values.description,
		start: rendezVousStart.toDate(),
		end: rendezVousEnd.toDate()
	};
}
