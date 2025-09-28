import { page } from '$app/state';
import dayjs from 'dayjs';
import { getTarificationInitialValues } from './tarifHelpers';
import { appState } from '../../../managers/AppState.svelte';
import { seanceTypes } from '../validators/baseValidators';
import { Seance } from '../../../user-ops-handlers/models';
import { untrack } from 'svelte';

export function initialSeanceValues({ patient, sp, seance, prescriptions, tarifs, mode }) {
	const tarifMetadata = getTarificationInitialValues(sp, tarifs, seance);
	let fromCalendarDate = page.url.searchParams.get('date');
	let now = dayjs().format('YYYY-MM-DD');
	return {
		user_id: appState.user.id,
		patient_id: patient.patient_id,
		sp_id: sp.sp_id,
		prescription_id:
			(seance?.prescription_id ?? prescriptions.length === 1)
				? prescriptions[0].prescription_id
				: null,
		duree: seance?.duree ?? sp.duree,
		seanceType:
			typeof seance?.seance_type === 'number' ? seanceTypes[seance.seance_type] : undefined,
		lieu_id: seance?.lieu_id ?? sp?.lieu_id,
		start: seance?.start,
		duree_custom:
			seance?.metadata?.duree_custom ?? defineDuree(sp.duree, sp.patho_lourde_type, sp.lieu_id),
		seance_id: seance?.seance_id ?? crypto.randomUUID(),
		created_at: seance?.created_at ?? now,
		date: seance?.date ?? fromCalendarDate ?? now,
		ticket_moderateur: seance?.ticket_moderateur ?? patient.ticket_moderateur ?? true,
		indemnite: seance?.indemnite ?? (sp.lieu_id === 3 || sp.groupe_id === 6 ? true : false),
		rapport_ecrit: seance?.rapport_ecrit ?? false,
		intake: seance?.metadata?.intake ?? false,
		supplements_ponctuels:
			seance?.metadata?.supplements_ponctuels?.map((s) => ({
				id: undefined,
				user_id: undefined,
				created_at: undefined,
				nom: s.nom,
				valeur: s.valeur
			})) ?? [],
		groupe_id: sp.groupe_id,
		patho_lourde_type: sp.patho_lourde_type,
		mode,
		...tarifMetadata,
		supplements: seance?.metadata?.supplements ?? [],
		is_paid: seance?.is_paid ?? false,
		payment_method: seance?.payment_method ?? null
	};
}

class SeanceReactiveSetup {
	sTypes = [
		{ label: 'Séance de kinésitherapie', id: 'kiné', value: 'kiné' },
		{ label: 'Séance à titre consultative', id: 'consult', value: 'consult' },
		{ label: 'Seconde séance dans la journée', id: 'seconde', value: 'seconde' },
		{ label: "Le patient ne s'est pas présenté", id: 'no-show', value: 'no-show' }
	];
	seanceTypes = $state(this.sTypes);
	dateWarning = $state();
	alreadyOneSeanceWarning =
		'Attention, il y a déjà une séance ce jour là. <br /> Si cela est permis vous pouvez tarifez une seconde séance. Pour le volet j) d\'une pathologie lourde veuillez sélectionner "séance de kinésitherapie" et non "seconde séance"';
	alreadyTwoSeanceWarning =
		"Attention, il y a déjà deux séances ce jour là, votre attestation risque d'être invalide si vous ne soignez pas une pathologie lourde volet j). Vous n'avez pas spécifié ces données dans le formulaire situation pathologique. Kiné Helper n'est donc pas en mesure de valider ce champ. Si vous êtes sûr de vous, Kiné Helper ne vous bloquera pas.";
	shortenedTwoSeanceWarning = 'Attention, il y a déjà deux séances ce jour là !';
	duree_custom_help =
		'Deux durées possibles dans la nomenclature : 15 ou 30 minutes. Pour toutes durées supérieures à 20 minutes Kiné Helper assignera le code de nomenclature de 30 minutes.';
	constructor({ groupe_id, sp_id }) {
		this.checkIfRapportEcrit = new Promise(async (resolve, reject) => {
			// Here the groups that doesn't allow a rapport ecrit to be created
			if (typeof groupe_id === 'number' && [0, 6, 7].includes(groupe_id)) {
				resolve(true);
			}
			let { data, error } = await appState.db.select(
				`SELECT * FROM seances WHERE sp_id = $1 AND rapport_ecrit = $2`,
				[sp_id, true]
			);
			console.log('In check rapport ecrit : fetched seance', data);

			// We filter out the seances that are no-shows
			data = data.filter((s) => s.seance_type !== 3);

			// We filter out the seances that are not in the same year
			data = data.filter((s) => {
				const seanceDate = dayjs(s.date);
				const currentDate = dayjs();
				return seanceDate.year() === currentDate.year();
			});

			console.log('In check rapport ecrit : filtered seance', data);
			if (error) {
				reject(error);
			}
			if (data.length > 0) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
		this.checkIfIntake = new Promise(async (resolve, reject) => {
			if (groupe_id && groupe_id !== 0) {
				resolve(true);
			}
			let { data, error } = await appState.db.select(
				`SELECT * FROM seances WHERE json_extract(metadata, '$.intake') is not NULL AND seance_type != 3 AND sp_id = $1;`,
				[sp_id]
			);

			if (error) {
				reject(error);
			}

			if (data.length > 0) {
				console.log('In check intake : returning true');
				resolve(true);
			} else {
				resolve(false);
			}
		});
	}
}

export class SingleSeanceSetup extends SeanceReactiveSetup {
	constructor(seance, formHandler, { sp_id, groupe_id, patho_lourde_type }) {
		super({ groupe_id, sp_id });
		$effect(() => {
			appState.db
				.select('SELECT * FROM seances WHERE date(date) = $1 AND sp_id = $2', [
					formHandler.form.date,
					sp_id
				])
				.then(({ data, error }) => {
					untrack(() => {
						console.log('data', data);
						if (error) {
							formHandler.message =
								'Erreur, la table séance ne peut pas être sélectionnée :  ' + error;
						}
						if (data.length === 0) {
							if (formHandler.form.seanceType === 'seconde') {
								formHandler.form.seanceType = 'kiné';
							}
							formHandler.message = null;
							this.dateWarning = null;
							console.log('sTypes', this.sTypes);
							this.seanceTypes = this.sTypes.filter(
								(st) => st.value !== 'seconde' || st.value === 'no-show'
							);
						}
						if (data.length === 1) {
							const doesSeanceExist = data[0].seance_id === seance?.seance_id;
							console.log('doesSeanceExist', doesSeanceExist);
							if (doesSeanceExist) {
								const s = new Seance(data[0]);
								formHandler.form.seanceType = seanceTypes[s.seance_type];
								this.dateWarning = '';
								this.seanceTypes = this.sTypes.filter((st) => st.value !== 'seconde');
								console.log('sTypes', $state.snapshot(this.seanceTypes));
								return;
							}
							this.dateWarning = this.alreadyOneSeanceWarning;
							if (
								typeof groupe_id === 'number' &&
								groupe_id === 1 &&
								typeof patho_lourde_type === 'number' &&
								patho_lourde_type === 5
							) {
								formHandler.form.seanceType = 'kiné';
								this.seanceTypes = this.sTypes.filter((st) => {
									st.value === 'kiné' || st.value === 'no-show';
								});
							} else {
								formHandler.form.seanceType = 'seconde';
								this.seanceTypes = this.sTypes.filter(
									(st) => st.value === 'seconde' || st.value === 'no-show'
								);
							}
						}
						if (data.length > 1) {
							const doesSeanceExist = data[0].seance_id === seance?.seance_id;
							console.log('doesSeanceExist', doesSeanceExist);
							if (doesSeanceExist) {
								const s = new Seance(data[0]);
								formHandler.form.seanceType = seanceTypes[s.seance_type];
								this.seanceTypes = this.sTypes.filter((st) => st.value != 'seconde');
								return;
							}
							if (
								typeof groupe_id === 'number' &&
								groupe_id !== 1 &&
								typeof patho_lourde_type === 'number' &&
								patho_lourde_type !== 5
							) {
								this.dateWarning = this.shortenedTwoSeanceWarning;
							} else {
								this.dateWarning = this.alreadyTwoSeanceWarning;
							}
						}
					});
				});
		});
	}
}

export class MultipleSeanceSetup extends SeanceReactiveSetup {
	selectedSeance = $state();
	ec;

	constructor(formHandler, { sp_id, groupe_id, patho_lourde_type }) {
		super({ groupe_id, sp_id });
		$effect(() => {
			// here we check for seances the same day as the selected seance. We need to check it against both the already recorded seances (in the db) and the seances in the form (using ec.getEvents)

			//The seance to check
			const seance = formHandler.form.seances[this.selectedSeance];
			if (seance) {
				// First querying the db
				// Todo (in the Cloud version this might be querying a cache whatever we choose, storing it in the Tauri AppState or using the db as cache, either way we will still need async code)
				appState.db
					.select('SELECT * FROM seances WHERE date(date) = $1 AND sp_id = $2', [
						seance.date,
						sp_id
					])
					.then(({ data, error }) => {
						// Here we untrack the data to avoid $effect to be retriggered
						// This might be unnecessary as we are using a promise and state isn't reactive in a then block
						untrack(() => {
							// Now we supposed to have a list of Seances the same day in the db.
							// So we add the seances from the form to the data array to know how much seances on the same day
							data.push(
								...formHandler.form.seances.filter((s) => {
									const sDate = dayjs(dayjs(s.date).format('YYYY-MM-DD'));
									const dDate = dayjs(dayjs(seance.date).format('YYYY-MM-DD'));
									return sDate.isSame(dDate) && s.sp_id === sp_id;
								})
							);
							console.log('data', data);
							if (error) {
								formHandler.message =
									'Erreur, la table séance ne peut pas être sélectionnée :  ' + error;
							}
							// If there is only one seance it means that it must be a kiné seance (consultative seances are only allowed once so ppl should not be able to add consultative seance on the MultipleSeanceForm)
							if (data.length === 1) {
								if (seance.seanceType === 'seconde') {
									seance.seanceType = 'kiné';
								}
								formHandler.message = null;
								this.dateWarning = null;
								console.log('sTypes', this.sTypes);
								// This is no longer necessary as we don't build seances on the fly but rather with a prototype at the validation step
								this.seanceTypes = this.sTypes.filter(
									(st) => st.value !== 'seconde' || st.value === 'no-show'
								);
							}
							if (data.length === 2) {
								this.dateWarning = this.alreadyOneSeanceWarning;
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
								if (
									typeof groupe_id === 'number' &&
									groupe_id !== 1 &&
									typeof patho_lourde_type === 'number' &&
									patho_lourde_type !== 5
								) {
									this.dateWarning = this.shortenedTwoSeanceWarning;
								} else {
									this.dateWarning = this.alreadyTwoSeanceWarning;
								}
							}
						});
					});
			}
		});
	}
}

export let idFieldSchema = [
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

export const paymentFields = [
	{
		id: 'is_paid',
		name: 'is_paid',
		inputType: 'checkbox',
		checkboxLabel: 'Séance payée',
		checkboxDescription: 'Indique si la séance a déjà été payée par le patient.',
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'payment_method',
		name: 'payment_method',
		inputType: 'select',
		selectOptions: ['cash', 'carte', 'virement', 'qrCode'],
		label: 'Mode de paiement',
		options: [
			{ label: 'Espèces', value: 'cash' },
			{ label: 'Carte bancaire', value: 'carte' },
			{ label: 'Virement', value: 'virement' },
			{ label: 'QR Code', value: 'qrCode' }
		],
		placeholder: 'Sélectionnez un mode de paiement',
		help: null,
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	}
];
