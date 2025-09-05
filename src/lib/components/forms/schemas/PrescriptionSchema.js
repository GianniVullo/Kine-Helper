import {
	isoDate,
	nullish,
	number,
	pipe,
	transform,
	array as valibotArray,
	string,
	file as valibotFile,
	object as valibotObject
} from 'valibot';
import {
	inamiValidator,
	isoDateWithMessage,
	stringLengthMoreThan1,
	uuidVal
} from '../validators/baseValidators';

const user_id = uuidVal();
const patient_id = uuidVal();
const sp_id = uuidVal();
const prescription_id = uuidVal();
const created_at = isoDate();
const date = isoDateWithMessage();
const jointe_a = nullish(isoDate());
const nombre_seance = nullish(number());
const seance_par_semaine = nullish(number());
const prescripteurNom = stringLengthMoreThan1();
const prescripteurPrenom = stringLengthMoreThan1();
const prescripteurInami = inamiValidator();
const deja_faites = nullish(number());
const file = pipe(
	transform((input) => {
		return input?.length === 0 ? null : input?.[0];
	}),
	nullish(valibotFile()),
	transform((input) => {
		return input?.length === 0 ? null : input?.[0];
	})
);

const froms = nullish(valibotArray(string()));
const file_name = nullish(string());

export const validateurs = {
	user_id,
	patient_id,
	sp_id,
	created_at,
	prescription_id,
	date,
	jointe_a,
	nombre_seance,
	seance_par_semaine,
	prescripteurNom,
	prescripteurPrenom,
	prescripteurInami,
	file,
	file_name,
	froms,
	deja_faites
};
export const PrescriptionSchema = pipe(
	valibotObject({
		...validateurs
	}),
	transform((input) => {
		input.prescripteur = {
			nom: input.prescripteurNom,
			prenom: input.prescripteurPrenom,
			inami: input.prescripteurInami
		};

		delete input.prescripteurNom;
		delete input.prescripteurPrenom;
		delete input.prescripteurInami;
		delete input.scans;
		return input;
	})
);
