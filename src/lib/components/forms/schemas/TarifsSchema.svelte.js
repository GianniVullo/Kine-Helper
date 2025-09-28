import { nullish, array, object } from 'valibot';
import { tarifUnitValidator } from '../utils/tarifHelpers';
import { uuidVal } from '../validators/baseValidators';

// Tarifaction fields
const tarif_seance = nullish(tarifUnitValidator(true, 'custom'));
const tarif_indemnite = nullish(tarifUnitValidator(true, 'custom'));
const tarif_rapport_ecrit = nullish(tarifUnitValidator(true, 'custom'));
const tarif_consultatif = nullish(tarifUnitValidator(true, 'custom'));
const tarif_seconde_seance = nullish(tarifUnitValidator(true, 'custom'));
const tarif_intake = nullish(tarifUnitValidator(true, 'custom'));
const tarif_no_show = nullish(tarifUnitValidator(true, 'custom'));

const tarifs = nullish(array(tarifUnitValidator(false, 'custom')), []);

// Supplément field
const supplements = nullish(array(tarifUnitValidator()), []);

export const validateurs = {
	supplements,
	tarif_seance,
	tarif_indemnite,
	tarif_rapport_ecrit,
	tarif_consultatif,
	tarif_seconde_seance,
	tarif_intake,
	tarif_no_show,
	tarifs,
	organization_id: uuidVal()
};

export const TarifsSchema = object(validateurs);


export const fieldSchema = [
	{
		id: 'user_id',
		name: 'user_id',
		inputType: 'hidden'
	}
];
