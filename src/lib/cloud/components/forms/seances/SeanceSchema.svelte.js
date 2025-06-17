import {
	pipe,
	transform,
	transformAsync,
	nullish,
	number,
	isoDate,
	picklist,
	boolean,
	array,
	object,
	forwardAsync,
	pipeAsync
} from 'valibot';
import { createSeance, editSeance } from '../../../../user-ops-handlers/seances';
import { goto, invalidate } from '$app/navigation';
import { info, trace, error as errorLog } from '@tauri-apps/plugin-log';
import { appState } from '../../../../managers/AppState.svelte';
import { numericalString } from '../../../../utils/validationGenerics';
import { modelingMetadata, tarifUnitValidator } from '../tarification-fields/tarifHelpers';
import { filtrerLesChampsAUpdater } from '../../../database';
import { untrack } from 'svelte';
import { indexOf, isEmpty, isEqual } from 'lodash';
import { Seance } from '../../../../user-ops-handlers/models';
import { toast } from '../../../libraries/overlays/notificationUtilities.svelte';
import { successIcon } from '../../../../ui/svgs/IconSnippets.svelte';
import { isoDateWithMessage, isoTimeWithMessage, uuidVal } from '../validators/commons';
import { seanceSameDayValidator, seanceTypes } from '../validators/specifics/seance';
import { defineDuree, payment_methods } from './Commons.svelte';

export function buildSeanceSchema() {
	const modeChoices = ['create', 'update'];

	const user_id = uuidVal;
	const patient_id = uuidVal;
	const sp_id = uuidVal;
	const prescription_id = uuidVal;
	const seance_id = uuidVal;
	const date = pipe(
		transform((input) => (input?.length === 0 ? null : input)),
		isoDateWithMessage
	);

	//* start and custom durée
	const start = pipe(
		transform((input) => (input?.length === 0 ? null : input)),
		isoTimeWithMessage
	);
	const duree = number();
	const lieu_id = number();
	const duree_custom = number();
	const created_at = isoDate();
	const seanceType = nullish(picklist(seanceTypes), 'kiné');
	const mode = picklist(modeChoices);
	const indemnite = boolean();
	const ticket_moderateur = boolean();
	const rapport_ecrit = nullish(boolean());
	const intake = nullish(boolean());
	const groupe_id = nullish(number());
	const patho_lourde_type = nullish(number());
	const is_paid = boolean();
	const payment_method = nullish(picklist(payment_methods));

	// Tarifaction fields
	const supplements = nullish(array(uuidVal));
	const supplements_ponctuels = nullish(array(tarifUnitValidator()));

	const tarif_seance = nullish(uuidVal);
	const tarif_indemnite = nullish(uuidVal);
	const tarif_rapport_ecrit = nullish(uuidVal);
	const tarif_consultatif = nullish(uuidVal);
	const tarif_seconde_seance = nullish(uuidVal);
	const tarif_intake = nullish(uuidVal);
	const tarif_no_show = nullish(uuidVal);
	const tarif_seance_custom = numericalString;
	const tarif_indemnite_custom = numericalString;
	const tarif_rapport_ecrit_custom = numericalString;
	const tarif_consultatif_custom = numericalString;
	const tarif_seconde_seance_custom = numericalString;
	const tarif_intake_custom = numericalString;
	const tarif_no_show_custom = numericalString;

	const validateurs = {
		user_id,
		patient_id,
		sp_id,
		prescription_id,
		seance_id,
		created_at,
		date,
		start,
		duree,
		lieu_id,
		duree_custom,
		ticket_moderateur,
		seanceType,
		indemnite,
		rapport_ecrit,
		intake,
		duree,
		groupe_id,
		patho_lourde_type,
		supplements,
		supplements_ponctuels,
		tarif_seance,
		tarif_indemnite,
		tarif_rapport_ecrit,
		tarif_consultatif,
		tarif_seconde_seance,
		tarif_intake,
		tarif_seance_custom,
		tarif_indemnite_custom,
		tarif_rapport_ecrit_custom,
		tarif_consultatif_custom,
		tarif_seconde_seance_custom,
		tarif_intake_custom,
		tarif_no_show,
		tarif_no_show_custom,
		mode,
		is_paid,
		payment_method
	};

	const SeanceSchema = pipeAsync(
		object({
			...validateurs
		}),
		//! pour l'instant je préfère qu'on passe seulement des warnings et que l'on ne fasse de blocage stricte car il y a toujours ce cas de figure en patho lourde ou le kiné peut aller voir le patient plus de deux fois par jour...
		forwardAsync(seanceSameDayValidator, ['date']),
		transformAsync(async (input) => {
			modelingMetadata(input);
			if (input.seanceType === 'kiné') {
				delete input.metadata.tarif_consultatif;
				delete input.metadata.tarif_seconde_seance;
			} else if (input.seanceType === 'consult') {
				delete input.metadata.tarif_seance;
				delete input.metadata.tarif_seconde_seance;
			} else if (input.seanceType === 'consult') {
				delete input.metadata.tarif_consultatif;
				delete input.metadata.tarif_seance;
			}
			if (input.supplements_ponctuels.length > 0) {
				input.metadata.ss_p = input.supplements_ponctuels.map((sup) => {
					return { nom: sup.nom, valeur: sup.valeur };
				});
			}
			delete input.supplements_ponctuels;
			if (input.intake) {
				input.metadata.intake = input.intake;
			}

			let duree_normale = defineDuree(input.duree, input.patho_lourde_type, input.lieu_id);
			if (!duree_normale || duree_normale !== input.duree_custom) {
				input.metadata.duree_custom = input.duree_custom;
			}
			input.seance_type = seanceTypes.indexOf(input.seanceType);
			delete input.seanceType;
			if (Object.keys(input.metadata).length === 0) {
				input.metadata = null;
			}

			if (input.mode === 'update') {
				const seance = new Seance(
					(
						await appState.db.select('SELECT * FROM seances WHERE seance_id = $1', [
							input.seance_id
						])
					).data[0]
				);
				if (isEqual(seance.metadata, input.metadata)) {
					delete input.metadata;
				}
				if (seance.seance_type === input.seance_type) {
					delete input.seance_type;
				}
			}
			if (input.payment_method) {
				input.payment_method = payment_methods.indexOf(input.payment_method);
			} else {
				delete input.payment_method;
			}
			delete input.duree_custom;
			delete input.tarif_no_show;
			delete input.tarif_no_show_custom;
			delete input.mode;
			delete input.intake;
			return input;
		})
	);
	return { SeanceSchema, validateurs };
}

export async function onValid(data) {
	trace('In SeanceForm.onValid');

	if (this.mode === 'create') {
		trace('Engaging Seance creation');
		// <!--* CREATE PROCEDURE -->
		const { error } = await createSeance(data);
		if (error) {
			return (this.message = error);
		}
		await invalidate('patient:layout');
		info('Seance Creation done Successfully');
	} else {
		trace('Engaging Seance modification');
		console.log('les data', data, this.touched);
		const updateFields = filtrerLesChampsAUpdater(this.touched, data);
		const modificationDone = !isEmpty(updateFields);
		console.log('les updateFields', updateFields, 'isEmpty', isEmpty(updateFields));
		// <!--* UPDATE PROCEDURE -->
		if (modificationDone) {
			const { error } = await editSeance(data, this.form.seance_id);
			if (error) {
				return (this.message = error);
			}
			await invalidate('patient:layout');
		}
		info('Seance modification done Successfully');
		toast.trigger({
			titre: modificationDone ? 'Séance modifiée avec succès.' : 'Aucune modification effectuée.',
			description: 'Vous retrouverez votre séance dans votre agenda',
			leading: successIcon,
			timeout: 3000
		});
	}

	goto(
		'/dashboard/patients/' +
			this.form.patient_id +
			'/situation-pathologique/' +
			this.form.sp_id +
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

export class ComplexSetup {
	dateChecked;
	seance;
	sTypes = [
		{ label: 'Séance de kinésitherapie', id: 'kiné', value: 'kiné' },
		{ label: 'Séance à titre consultative', id: 'consult', value: 'consult' },
		{ label: 'Seconde séance dans la journée', id: 'seconde', value: 'seconde' },
		{ label: "Le patient ne s'est pas présenté", id: 'no-show', value: 'no-show' }
	];
	seanceTypes = $state(this.sTypes);
	dateWarning = $state();

	constructor(dateChecked, seance, formHandler, { sp_id, groupe_id, patho_lourde_type }) {
		this.dateChecked = dateChecked;
		if (seance) {
			this.seance = new Seance(seance);
		}
		this.formHandler = formHandler;
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
							this.formHandler.message =
								'Erreur, la table séance ne peut pas être sélectionnée :  ' + error;
						}
						if (data.length === 0) {
							if (this.formHandler.form.seanceType === 'seconde') {
								this.formHandler.form.seanceType = 'kiné';
							}
							this.formHandler.message = null;
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
								this.formHandler.form.seanceType = seanceTypes[s.seance_type];
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
								this.formHandler.form.seanceType = 'kiné';
								this.seanceTypes = this.sTypes.filter((st) => {
									st.value === 'kiné' || st.value === 'no-show';
								});
							} else {
								this.formHandler.form.seanceType = 'seconde';
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
								this.formHandler.form.seanceType = seanceTypes[s.seance_type];
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
					});
				});
		});
	}
}
