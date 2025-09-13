import { boolean, isoDate, nullish, picklist, pipe, string, transform, object } from 'valibot';
import {
	digitVal,
	emailVal,
	isoDateEl,
	mutualiteValidator,
	nissValidator,
	postCodeValidator,
	stringLengthMoreThan1,
	uuidVal
} from '../validators/baseValidators';

const SEX = ['F', 'M'];
const user_id = uuidVal();
const patient_id = uuidVal();
const nom = stringLengthMoreThan1();
const prenom = nullish(string());
const niss = nullish(nissValidator());
const date_naissance = nullish(pipe(string(), isoDateEl()));
const sexe = nullish(picklist(SEX));
const adresse = nullish(string());
const cp = nullish(postCodeValidator());
const localite = nullish(string());
const num_affilie = nullish(string());
const tiers_payant = boolean();
const ticket_moderateur = boolean();
const bim = boolean();
const mutualite = nullish(mutualiteValidator());
const email = pipe(
	transform((input) => (input?.length == 0 ? null : input)),
	nullish(pipe(string(), emailVal()))
);
const tel = pipe(
	transform((input) => (input ? input : null)),
	nullish(pipe(string(), digitVal()))
);
const gsm = pipe(
	transform((input) => (input ? input : null)),
	nullish(pipe(string(), digitVal()))
);

export const validateurs = {
	// Id
	user_id,
	patient_id,
	nom,
	prenom,
	niss,
	date_naissance,
	sexe,
	adresse,
	cp,
	localite,
	// Assurabilité
	num_affilie,
	tiers_payant,
	ticket_moderateur,
	bim,
	mutualite,
	//// numero_etablissement,
	//// service,
	// Contact
	tel,
	gsm,
	email,
	organization_id: uuidVal()
};

export const PatientSchema = pipe(
	object({
		...validateurs
	})
);
