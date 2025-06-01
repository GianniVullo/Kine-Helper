import { pipeAsync, objectAsync, arrayAsync, transform, array, object } from 'valibot';
import { createMultipleSeances } from '../../../../user-ops-handlers/seances';
import { goto, invalidate } from '$app/navigation';
import { info, trace, error as errorLog } from '@tauri-apps/plugin-log';
import { appState } from '../../../../managers/AppState.svelte';
import { modelingMetadata } from '../tarification-fields/tarifHelpers';
import { duree_int } from '../../../../stores/codeDetails';
import { untrack } from 'svelte';
import { Seance } from '../../../../user-ops-handlers/models';
import dayjs from 'dayjs';
import { eventFormater } from '../../../../utils/calendarEventFormater';
import { buildSeanceSchema } from './SeanceSchema.svelte';
import { multipleSeanceMinLengthValidator } from '../validators/specifics/seance';

export function buildMultipleSeancesSchema() {
	let { SeanceSchema, validateurs } = buildSeanceSchema();
	return {
		MultipleSeancesSchema: pipeAsync(
			objectAsync({
				seances: pipeAsync(arrayAsync(SeanceSchema), multipleSeanceMinLengthValidator)
			}),
			transform((input) => {
				for (const seance of input.seances) {
					modelingMetadata(seance);
					if (seance.seanceType === 'kiné') {
						delete seance.metadata.tarif_consultatif;
						delete seance.metadata.tarif_seconde_seance;
					} else if (seance.seanceType === 'consult') {
						delete seance.metadata.tarif_seance;
						delete seance.metadata.tarif_seconde_seance;
					} else if (seance.seanceType === 'seconde') {
						delete seance.metadata.tarif_consultatif;
						delete seance.metadata.tarif_seance;
					}
					if (seance.supplements_ponctuels.length > 0) {
						seance.metadata.ss_p = seance.supplements_ponctuels.map((sup) => {
							return { nom: sup.nom, valeur: sup.valeur };
						});
					}
					delete seance.supplements_ponctuels;
					if (seance.intake) {
						seance.metadata.intake = seance.intake;
					}

					let duree_normale = defineDuree(seance.duree, seance.patho_lourde_type, seance.lieu_id);
					if (!duree_normale || duree_normale !== seance.duree_custom) {
						seance.metadata.duree_custom = seance.duree_custom;
					}
					seance.seance_type = seanceTypes.indexOf(seance.seanceType);
					delete seance.seanceType;
					if (Object.keys(seance.metadata).length === 0) {
						seance.metadata = null;
					}
					delete seance.duree_custom;
					delete seance.tarif_no_show;
					delete seance.tarif_no_show_custom;
					delete seance.mode;
					delete seance.intake;
					console.log('input', seance);
				}
				return input;
			})
		),
		validateurs: { seances: array(object(validateurs)) }
	};
}

export async function onValid(data) {
	// trace('in onValid with data' + JSON.stringify(data));
	console.log('onValid', data);
	// <!--* CREATE PROCEDURE -->
	// TODO Il faut créer une méthode createMultipleSeances
	const { error } = await createMultipleSeances(data);
	if (error) {
		return (this.message = error);
	}
	await invalidate('patient:layout');
	info('Seance Creation done Successfully');

	goto(
		'/dashboard/patients/' +
			this.form.seances[0].patient_id +
			'/situation-pathologique/' +
			this.form.seances[0].sp_id +
			'/seances'
	);
}

export const idFieldSchema = [
	{
		id: 'patient_id',
		name: 'patient_id',
		inputType: 'hidden'
	},
	{
		id: 'created_at',
		name: 'created_at',
		inputType: 'hidden'
	},
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	},
	{
		id: 'sp_id',
		name: 'sp_id',
		inputType: 'hidden'
	},
	{
		id: 'seance_id',
		name: 'seance_id',
		inputType: 'hidden'
	}
];

export const dateField = {
	id: 'date',
	name: 'date',
	inputType: 'date',
	placeholder: 'Date de la séance',
	titre: 'Date',
	help: null,
	outerCSS: 'col-span-full sm:col-span-2',
	innerCSS: ''
};

export const checkboxesFields = [
	{
		id: 'indemnite',
		name: 'indemnite',
		inputType: 'checkbox',
		checkboxLabel: 'Indemnité de déplacement',
		checkboxDescription:
			"Cochez cette case si la séance était à domicile. Attention, si vous traitez deux patients au même domicile vous ne pouvez compter l'indemnité que pour un seul des deux patients.",
		outerCSS: 'sm:col-span-4',
		innerCSS: ''
	},
	{
		id: 'rapport_ecrit',
		name: 'rapport_ecrit',
		inputType: 'checkbox',
		checkboxLabel: 'Rapport écrit',
		checkboxDescription:
			'Indique si vous avez effectué un rapport écrit. <br /> Les groupes PATHOLOGIE COURANTE, PALLIATIF et HOPITAL DE JOUR ne peuvent pas compter de rapport écrit',
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'intake',
		name: 'intake',
		inputType: 'checkbox',
		checkboxLabel: 'Intake',
		checkboxDescription:
			'Compter un intake. Attention une fois par an/par patient.<br /> UNIQUEMENT POUR LA PATHOLOGIE COURANTE',
		outerCSS: 'col-span-full',
		innerCSS: ''
	},
	{
		id: 'ticket_moderateur',
		name: 'ticket_moderateur',
		inputType: 'checkbox',
		checkboxLabel: 'Ticket modérateur',
		checkboxDescription: 'Cochez cette case si le patient paie le ticket modérateur.',
		outerCSS: 'col-span-full',
		innerCSS: ''
	}
];

export function defineDuree(duree, patho_lourde_type, lieu_id) {
	if (duree) {
		return duree_int(duree);
	}
	if (patho_lourde_type) {
		switch (patho_lourde_type) {
			case 0:
				if ([0, 1, 2, 3, 7].includes(lieu_id)) {
					return 30;
				}
				return 20;
			case 1 || 2:
				return 60;
			case 3:
				return 120;
			case 4:
				return 45;
			case 5:
				return null;
			default:
				break;
		}
	}
	if (patho_lourde_type === 5) {
		return 60;
	}
	return 30;
}

export class ComplexSetup {
	sTypes = [
		{ label: 'Séance de kinésitherapie', id: 'kiné', value: 'kiné' },
		{ label: 'Séance à titre consultative', id: 'consult', value: 'consult' },
		{ label: 'Seconde séance dans la journée', id: 'seconde', value: 'seconde' },
		{ label: "Le patient ne s'est pas présenté", id: 'no-show', value: 'no-show' }
	];
	seanceTypes = $state(this.sTypes);
	dateWarning = $state();
	selectedSeance = $state();
	ec;

	constructor(formHandler, { sp_id, groupe_id, patho_lourde_type }, patient) {
		this.formHandler = formHandler;
		this.patient = patient;
		$effect(() => {
			const seance = formHandler.form.seances[this.selectedSeance];
			if (seance) {
				appState.db
					.select('SELECT * FROM seances WHERE date(date) = $1 AND sp_id = $2', [
						seance.date,
						sp_id
					])
					.then(({ data, error }) => {
						untrack(() => {
							data.push(
								...this.formHandler.form.seances.filter((s) => {
									const sDate = dayjs(dayjs(s.date).format('YYYY-MM-DD'));
									const dDate = dayjs(dayjs(seance.date).format('YYYY-MM-DD'));
									return sDate.isSame(dDate) && s.sp_id === sp_id;
								})
							);
							console.log('data', data);
							if (error) {
								this.formHandler.message =
									'Erreur, la table séance ne peut pas être sélectionnée :  ' + error;
							}
							if (data.length === 1) {
								if (seance.seanceType === 'seconde') {
									seance.seanceType = 'kiné';
								}
								this.formHandler.message = null;
								this.dateWarning = null;
								console.log('sTypes', this.sTypes);
								this.seanceTypes = this.sTypes.filter(
									(st) => st.value !== 'seconde' || st.value === 'no-show'
								);
							}
							if (data.length === 2) {
								const doesSeanceExist = data[0].seance_id === seance?.seance_id;
								console.log('doesSeanceExist', doesSeanceExist);
								if (doesSeanceExist) {
									const s = new Seance(data[0]);
									seance.seanceType = seanceTypes[s.seance_type];
									this.dateWarning = '';
									this.seanceTypes = this.sTypes.filter((st) => st.value !== 'seconde');
									console.log('sTypes', $state.snapshot(this.seanceTypes));
									return;
								}
								this.dateWarning =
									'Attention, il y a déjà une séance ce jour là. <br /> Si cela est permis vous pouvez tarifez une seconde séance. Pour le volet j) d\'une pathologie lourde veuillez sélectionner "séance de kinésitherapie"';
								if (
									typeof groupe_id === 'number' &&
									groupe_id === 1 &&
									typeof patho_lourde_type === 'number' &&
									patho_lourde_type === 5
								) {
									seance.seanceType = 'kiné';
									this.seanceTypes = this.sTypes.filter((st) => {
										st.value === 'kiné' || st.value === 'no-show';
									});
								} else {
									seance.seanceType = 'seconde';
									this.seanceTypes = this.sTypes.filter(
										(st) => st.value === 'seconde' || st.value === 'no-show'
									);
								}
							}
							if (data.length > 2) {
								const doesSeanceExist = data[0].seance_id === seance?.seance_id;
								console.log('doesSeanceExist', doesSeanceExist);
								if (doesSeanceExist) {
									const s = new Seance(data[0]);
									seance.seanceType = seanceTypes[s.seance_type];
									this.seanceTypes = this.sTypes.filter((st) => st.value != 'seconde');
									return;
								}
								if (
									typeof groupe_id === 'number' &&
									groupe_id !== 1 &&
									typeof patho_lourde_type === 'number' &&
									patho_lourde_type !== 5
								) {
									this.dateWarning = 'Attention, il y a déjà deux séances ce jour là !';
								} else {
									this.dateWarning =
										"Attention, il y a déjà deux séances ce jour là, votre attestation risque d'être invalide si vous ne soignez pas une pathologie lourde volet j). Vous n'avez pas spécifié ces données dans le formulaire situation pathologique. Kiné Helper n'est donc pas en mesure de valider ce champ. Si vous êtes sûr de vous, Kiné Helper ne vous bloquera pas.";
								}
							}
							let relatedEventSeance = this.ec?.getEventById(seance.seance_id).extendedProps.seance;
							console.log('Dates are equal', seance.date === relatedEventSeance.date);
							if (seance.date != relatedEventSeance.date) {
								this.ec.updateEvent(eventFormater($state.snapshot(seance), this.patient));
							}
						});
					});
			}
		});
	}
}
