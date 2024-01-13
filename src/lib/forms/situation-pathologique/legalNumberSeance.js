function seancesTillEndOfYear(seancePerWeek) {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();

	// Create a date for the last day of the year
	const endOfYear = new Date(currentYear, 11, 31); // December 31

	// Calculate the difference in milliseconds
	const differenceInMilliseconds = endOfYear - currentDate;

	// Convert milliseconds to days
	const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

	// Convert days to weeks
	const weeksLeft = Math.ceil(differenceInDays / 7);

	return weeksLeft * seancePerWeek;
}

export const maxLegalNumberSeance = [
	// Pathologie courante
	{
		seance_gen_nombre(lieu, { duree, seancePerWeek }) {
			if (parseInt(duree) == 0) {
				return seancesTillEndOfYear(seancePerWeek);
			}
			return 18;
		},
	},
	// Pathologie lourde
	{
		seance_gen_nombre(lieu, { pathoLourdeType, patient, gmfcs, seancePerWeek }) {
			let parsedType = parseInt(pathoLourdeType);
			if (parsedType == 1) {
				// Si le patient est dans son 21ième anniversaire
				if (new Date().getFullYear() - patient.date_naissance.getFullYear() > 21) {
					if (gmfcs > 3) {
						return 200;
					} else if (gmfcs > 1) {
						return 150;
					} else {
						return 100;
					}
				}
			} else if ([2, 3].includes(parsedType)) {
				//? drainage
				// Que ce soit 60 ou 120 min c'est 120 séances/an autorisées
				return 120;
			} else if (parsedType == 4) {
				// 45 min, doi être explicitement mentionnée sur la prescription
				return 50;
			} else if (parsedType == 5) {
				// si il s'agit des séances de 60 minutes au global pour les pathos du volet J)
				return 30; // /!\ il s'agit de 10/prescriptions
			}
			return seancesTillEndOfYear(seancePerWeek);
		},
	},
	// Grossesse et Post-partum
	{
		seance_gen_nombre(lieu, { duree }) {
			return 9;
		},
	},
	// Fa
	{
		seance_gen_nombre(lieu, { voletJ }) {
			if (voletJ) {
				return 120;
			}
			return 60;
		},
	},
	// Fb
	{
		seance_gen_nombre(lieu, { voletH }) {
			return 80;
		},
	},
	// Palliatif à domicile
	{
		seance_gen_nombre(lieu, { seancePerWeek }) {
			return seancesTillEndOfYear(seancePerWeek);
		},
	},
	// Hopital
	{
		seance_gen_nombre(lieu, { seancePerWeek }) {
			return seancesTillEndOfYear(seancePerWeek);
		},
	}
];
