import {
	isoDate,
	pipe,
	transform,
	nullish,
	string,
	array,
	number,
	picklist,
	boolean,
	object,
	forward
} from 'valibot';
import { modelingMetadata } from '../utils/tarifHelpers';
import {
	ambHosValidator,
	groupValidator,
	numericalString,
	// imcPatientAgeValidator, Faker, What was that ?
	imcValidator,
	lieuValidator,
	patho_lourde_typeValidator,
	uuidVal,
	stringLengthMoreThan1
} from '../validators/baseValidators';

const SEX = ['AMB', 'HOS', null, undefined];
const DUREE_SS_FA = [-1, 0, 3];

const user_id = uuidVal();
const patient_id = uuidVal();
const sp_id = uuidVal();
const created_at = isoDate();
const motif = stringLengthMoreThan1();
const plan_du_ttt = nullish(string());
const numero_etablissement = pipe(
	transform((input) => (input?.length === 0 ? null : input)),
	nullish(string())
);
const service = pipe(
	transform((input) => (input?.length === 0 ? null : input)),
	nullish(string())
);

// Tarifaction fields
const supplements = nullish(array(uuidVal()));

const tarif_seance = nullish(uuidVal());
const tarif_indemnite = nullish(uuidVal());
const tarif_rapport_ecrit = nullish(uuidVal());
const tarif_consultatif = nullish(uuidVal());
const tarif_seconde_seance = nullish(uuidVal());
const tarif_intake = nullish(uuidVal());
const tarif_no_show = nullish(uuidVal());
const tarif_seance_custom = numericalString();
const tarif_indemnite_custom = numericalString();
const tarif_rapport_ecrit_custom = numericalString();
const tarif_consultatif_custom = numericalString();
const tarif_seconde_seance_custom = numericalString();
const tarif_intake_custom = numericalString();
const tarif_no_show_custom = numericalString();
// The nomenclature fields
// Ces champs peuvent être nul ici et dans la création de séance mais pas dans la génération d'attestation
const groupe_id = groupValidator();
const lieu_id = lieuValidator();
const duree = pipe(
	transform((input) => (!input ? null : input)),
	nullish(number())
);
// TODO: make some of these conditionally mandatory
const patho_lourde_type = nullish(number());
const gmfcs = nullish(number());
const duree_ss_fa = nullish(picklist(DUREE_SS_FA));
const volet_j = nullish(boolean());
const amb_hos = nullish(picklist(SEX));

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	created_at,
	motif,
	plan_du_ttt,
	numero_etablissement,
	service,
	groupe_id,
	lieu_id,
	duree,
	patho_lourde_type,
	gmfcs,
	amb_hos,
	duree_ss_fa,
	volet_j,
	supplements,
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
	tarif_no_show_custom
};

export const SPSchema = pipe(
	object({
		...validateurs
	}),
	forward(ambHosValidator(), ['amb_hos']),
	forward(patho_lourde_typeValidator(), ['patho_lourde_type']),
	forward(imcValidator(), ['gmfcs']),
	//! Je ne sais plus à quoi sert le validateur patien
	// forward(imcPatientAgeValidator, ['duree']),
	transform((input) => {
		modelingMetadata(input);
		if (input.duree_ss_fa !== -1) {
			input.metadata.duree_ss_fa = input.duree_ss_fa;
		}
		if (input.volet_j) {
			input.metadata.volet_j = input.volet_j;
		}
		delete input.volet_j;
		delete input.duree_ss_fa;
		if (Object.keys(input.metadata).length === 0) {
			input.metadata = null;
		} else {
			input.metadata = JSON.stringify(input.metadata);
		}
		return input;
	})
);
