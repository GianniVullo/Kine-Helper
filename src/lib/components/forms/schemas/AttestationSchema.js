import { boolean, isoDate, array, object, number, string, pipe, transform } from 'valibot';
import { isMobile } from '../../../utils/platformwhoami';
import { t } from '$lib/i18n';
import { get } from 'svelte/store';
import {
	integerValidator,
	isoDateWithMessage,
	moneyValidator,
	stringLengthMoreThan1ButCanBeNull,
	uuidVal
} from '../validators/baseValidators';
import { INTER_MUTUELLE, queryBuilder } from '../utils/attestationUtils';

const user_id = uuidVal();
const patient_id = uuidVal();
const sp_id = uuidVal();
const prescription_id = uuidVal();
const attestation_id = uuidVal();
const date = isoDateWithMessage();
const created_at = isoDate();
const porte_prescr = boolean();
const has_been_printed = boolean();
const generateFacturePatient = boolean();
const printFacturePatient = boolean();
const generateFactureMutuelle = boolean();
const printFactureMutuelle = boolean();
const numero_etablissement = stringLengthMoreThan1ButCanBeNull();
const service = stringLengthMoreThan1ButCanBeNull();
const total_recu = moneyValidator();
const valeur_totale = moneyValidator();
const mutuelle_paid = boolean();
const patient_paid = boolean();
const lines = array(
	object({
		id: number(),
		description: string(),
		date: string(),
		code: object({
			code_id: uuidVal(),
			code_reference: string(),
			honoraire: number(),
			remboursement: pipe(
				transform((input) => (typeof input === 'string' ? JSON.parse(input) : input))
			)
		}),
		valeur_totale: number(),
		total_recu: number(),
		seance_id: uuidVal()
	})
);
const seances = array(
	object({
		seance_id: uuidVal(),
		code_id: uuidVal(),
		metadata: object({
			valeur_totale: number(),
			total_recu: number()
		})
	})
);
const tiers_payant = boolean();
const ticket_moderateur = boolean();
const bim = boolean();
const numero = integerValidator();

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	prescription_id,
	attestation_id,
	date,
	created_at,
	porte_prescr,
	has_been_printed,
	generateFacturePatient,
	generateFactureMutuelle,
	printFacturePatient,
	printFactureMutuelle,
	total_recu,
	valeur_totale,
	mutuelle_paid,
	patient_paid,
	numero_etablissement,
	service,
	lines,
	tiers_payant,
	ticket_moderateur,
	bim,
	numero,
	seances,
	organization_id: uuidVal()
};

/**
 * 			generateFacturePatient: bool,
			generateFactureMutuelle: bool,
			has_been_printed: bool,
			attestation: {
				user_id: uuid,
				patient_id: uuid,
				sp_id: uuid,
				prescription_id: uuid,
				attestation_id: uuid,
				created_at: datetime,
				date: date,
				porte_prescr: bool,
				has_been_printed: bool,
				numero_etablissement: string,
				service: string,
				total_recu: decimal with 2 decimals,
				valeur_totale: decimal with 2 decimals,
				mutuelle_paid: bool,
				patient_paid: bool,
				numero: int
			},
			facturePatient: {
				id: uuid,
				user_id: uuid,
				patient_id: uuid,
				sp_id: uuid,
				date: date,
				type: enum('patient', 'mutuelle'),
				total: decimal with 2 decimals
			},
			factureMutuelle: {
				id: uuid,
				user_id: uuid,
				patient_id: uuid,
				sp_id: uuid,
				date: date,
				type: enum('patient', 'mutuelle'),
				total: decimal with 2 decimals
			},
			seances: {
				seance_id: uuid,
				code_id: uuid,
				metadata: {
					valeur_totale: decimal with 2 decimals,
					total_recu: decimal with 2 decimals
				},
				has_been_attested: bool,
				attestation_id: uuid,
				prescription_id: uuid,
				seance_type: int,
				date: date,
				start: datetime,
			},
 */
export const AttestationSchema = pipe(
	object({
		...validateurs
	}),
	transform((input) => {
		// si tiers_payant, la valeur de la facture mutuelle est le remboursement du code en fonction du statut patient et kiné
		let factureMutuelle_total = 0;
		for (const line of input.lines) {
			if (input.tiers_payant) {
				factureMutuelle_total += line.code.remboursement[INTER_MUTUELLE + queryBuilder(input.bim)];
			}
		}
		return {
			generateFacturePatient: input.generateFacturePatient,
			printFacturePatient: input.printFacturePatient,
			generateFactureMutuelle: input.generateFactureMutuelle,
			has_been_printed: input.has_been_printed,
			printFactureMutuelle: input.printFactureMutuelle,
			attestation: {
				user_id: input.user_id,
				patient_id: input.patient_id,
				sp_id: input.sp_id,
				prescription_id: input.prescription_id,
				attestation_id: input.attestation_id,
				created_at: input.created_at,
				date: input.date,
				porte_prescr: input.porte_prescr,
				has_been_printed: input.has_been_printed,
				numero_etablissement: input.numero_etablissement,
				service: input.service,
				total_recu: input.total_recu,
				valeur_totale: input.valeur_totale,
				mutuelle_paid: input.mutuelle_paid,
				patient_paid: input.patient_paid,
				numero: input.numero,
				organization_id: input.organization_id
			},
			facturePatient: {
				id: crypto.randomUUID(),
				user_id: input.user_id,
				patient_id: input.patient_id,
				sp_id: input.sp_id,
				date: input.date,
				type: 'patient',
				total: input.total_recu,
				organization_id: input.organization_id
			},
			factureMutuelle: {
				id: crypto.randomUUID(),
				user_id: input.user_id,
				patient_id: input.patient_id,
				sp_id: input.sp_id,
				date: input.date,
				type: 'mutuelle',
				total: factureMutuelle_total,
				organization_id: input.organization_id
			},
			seances: input.seances,
			lines: input.lines.map((line) => ({
				code_reference: line.code.code_reference,
				date: line.date
			}))
		};
	})
);

export const idFields = [
	{
		id: 'patient_id',
		name: 'patient_id',
		inputType: 'hidden'
	},
	{
		id: 'organization_id',
		name: 'organization_id',
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
		id: 'prescription_id',
		name: 'prescription_id',
		inputType: 'hidden'
	},

	{
		id: 'attestation_id',
		name: 'attestation_id',
		inputType: 'hidden'
	},
	{
		id: 'created_at',
		name: 'created_at',
		inputType: 'hidden'
	}
];

export const financeCheckboxSchema = [
	{
		id: 'mutuelle_paid',
		name: 'mutuelle_paid',
		inputType: 'checkbox',
		checkboxLabel: 'La mutuelle a déjà payé cette attestation',
		checkboxDescription: 'Ce champ ne modifie votre interface que pour les patients tiers payant',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},

	{
		id: 'patient_paid',
		name: 'patient_paid',
		inputType: 'checkbox',
		checkboxLabel: 'Le patient a déjà payé cette attestation',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	}
];

export const financeSchema = [
	{
		id: 'valeur_totale',
		name: 'valeur_totale',
		inputType: 'text',
		label: 'Valeur Totale',
		help: 'Ce champs ne figurera pas sur l attestation',
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'total_recu',
		name: 'total_recu',
		inputType: 'text',
		label: 'Total Reçu',
		help: 'Veuillez introduire un nombre avec 2 décimales séparés par une virgule. Par example 50,35.',
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	}
];

export const actionFields = [
	{
		id: 'has_been_printed',
		name: 'has_been_printed',
		inputType: isMobile() ? 'hidden' : 'checkbox',
		checkboxLabel: "Imprimer l'attestation immédiatement",
		checkboxDescription:
			"Cochez cette case si vous souhaitez lancer l'impression de votre attestation immédiatement après son enregistrement dans la base de donnée.",
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	}
];

export const patient_field = [
	{
		id: 'generateFacturePatient',
		name: 'generateFacturePatient',
		inputType: 'checkbox',
		checkboxLabel: 'Générer la facture pour le patient',
		checkboxDescription: 'Une valeur par défaut peut être attribuée à ce champ via vos paramètres.',
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'printFacturePatient',
		name: 'printFacturePatient',
		inputType: 'checkbox',
		checkboxLabel: 'Imprimer la facture pour le patient',
		checkboxDescription:
			"Une valeur par défaut peut être attribuée à ce champ via vos paramètres. Attention, pour l'instant cette fonctionnalité ouvrira un pdf sur votre lecteur de pdf par défaut.",
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	}
];

export const mutuelleFields = [
	{
		id: 'generateFactureMutuelle',
		name: 'generateFactureMutuelle',
		inputType: 'checkbox',
		checkboxLabel: 'Générer la facture pour la mutuelle',
		checkboxDescription: 'Une valeur par défaut peut être attribuée à ce champ via vos paramètres.',
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'printFactureMutuelle',
		name: 'printFactureMutuelle',
		inputType: 'checkbox',
		checkboxLabel: 'Imprimer la facture pour la mutuelle',
		checkboxDescription:
			"Une valeur par défaut peut être attribuée à ce champ via vos paramètres. Attention, pour l'instant cette fonctionnalité ouvrira un pdf sur votre lecteur de pdf par défaut.",
		outerCSS: 'sm:col-span-3',
		innerCSS: ''
	}
];

export const fieldSchema = [
	{
		id: 'porte_prescr',
		name: 'porte_prescr',
		inputType: 'checkbox',
		checkboxLabel: 'La prescription est jointe à cette attestation',
		checkboxDescription: 'Cochez cette case si la prescription est jointe à cette attestation',
		outerCSS: 'sm:col-span-full',
		innerCSS: ''
	},
	{
		id: 'date',
		name: 'date',
		placeholder: "Date de l'attestation",
		inputType: 'date',
		titre: 'Date de l attestation',
		help: null,
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'numero',
		name: 'numero',
		inputType: 'number',
		titre: 'Numéro de l attestation',
		outerCSS: 'col-span-full sm:col-span-2',
		innerCSS: ''
	},
	{
		id: 'numero_etablissement',
		name: 'numero_etablissement',
		inputType: 'text',
		titre: get(t)('sp.update', 'label.numero_etablissement'),
		help: 'Seulement si le patient est hospitalisé',
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	},
	{
		id: 'service',
		name: 'service',
		inputType: 'text',
		titre: get(t)('sp.update', 'label.service'),
		help: 'Seulement si le patient est hospitalisé',
		outerCSS: 'col-span-full sm:col-span-3',
		innerCSS: ''
	}
];
