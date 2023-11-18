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
		seances_normales_executables(lieu, { duree, seancePerWeek }) {
			if ([4, 5, 8].includes(lieu)) {
				// 20min
				return 18;
			} else if ([0, 1, 2, 3, 7].includes(lieu) || parseInt(duree) == 2) {
				// 30min
				return 9;
			} else {
				return seancesTillEndOfYear(seancePerWeek); // 15 min et c'est en Hopital donc illimité
			}
		},
		seances_en_depassement_executables(lieu, { duree }) {
			if ([4, 5, 8].includes(lieu)) {
				// 20min
				return 54;
			} else if ([0, 1, 2, 3, 7].includes(lieu) || parseInt(duree) == 2) {
				// 30min
				return 9;
			} else {
				return 0;
			}
		},
		seances_en_surdepassement_executables(lieu, { duree }) {
			if ([4, 5, 8].includes(lieu)) {
				// 20min
				return 0; // (Il n'y a pas de surchargement)
			} else if ([0, 1, 2, 3, 7].includes(lieu) || parseInt(duree) == 2) {
				return 54;
			} else {
				return 0;
			}
		}
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
		seances_normales_executables(lieu, { pathoLourdeType, patient, gmfcs, seancePerWeek }) {
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
		}
	},
	// Seconde Seance par jour
	//! ça ne devrait pas se trouver ici
	{
		seances_normales_executables(lieu, { duree }) {
			if (duree == 0) {
				if (additional_info['hospitalise_USI_N_NIC']) {
					return 365;
				} else if (additional_info['est_REA__ORTHO_N500']) {
					// endéans les 30 jours
					return 14;
				} else {
					// Si le kiné a en sa possession
					return 365;
				}
			} else {
				// Pour la séance de 30 min => seulement en hospital et il faut que la prescription le mentionne clairement
				return 365; // déterminé par le medecin
			}
		}
	},
	// Grossesse et Post-partum
	{
		seance_gen_nombre(lieu, { duree }) {
			return 9;
		},
		seances_normales_executables(lieu, { duree }) {
			return 9;
		}
	},
	// Fa
	{
		seance_gen_nombre(lieu, { voletJ }) {
			if (voletJ) {
				return 120;
			}
			return 60;
		},
		seances_normales_executables(lieu, { voletJ }) {
			if ([4, 5, 8].includes(lieu)) {
				// Pour les séance de 20 minutes au MR psycho etc...
				if (voletJ) {
					// pour le cas des polytraumatisés (Onglet J)
					return 120;
				}
				return 60;
			} else if ([0, 1, 2, 3, 7].includes(lieu)) {
				// 30min
				return 20;
			}
			return 0;
		},

		seances_en_depassement_executables(lieu, { voletJ, seancePerWeek }) {
			if ([4, 5, 8].includes(lieu)) {
				// Pour les séance de 20 minutes au MR psycho etc...
				return seancesTillEndOfYear(seancePerWeek);
			} else if ([0, 1, 2, 3, 7].includes(lieu)) {
				// 30min
				if (voletJ) {
					return 100;
				}
				return 40;
			}
		},

		seances_en_surdepassement_executables(lieu, { seancePerWeek }) {
			if ([4, 5, 8].includes(lieu)) {
				// Pour les séance de 20 minutes au MR psycho etc...
				return 0;
			} else if ([0, 1, 2, 3, 7].includes(lieu)) {
				// 30min
				return seancesTillEndOfYear(seancePerWeek);
			}
		}
	},
	// Fb
	{
		seance_gen_nombre(lieu, { voletH }) {
			return 80;
		},
		seances_normales_executables(lieu, { duree }) {
			return 60;
		},
		seances_en_depassement_executables(lieu, { voletH }) {
			// Ici il y a une variante : les drainages lymphatiques n'ont pas de
			// dépassement. Le kiné effectue 60 drainages de 45 minutes puis il y a
			// les codes normaux de 30minutes.
			if (voletH) {
				return 0;
			}
			return 20;
		},
		seances_en_surdepassement_executables(lieu, { voletH, seancePerWeek }) {
			if (voletH) {
				// :/!\ le dépassement pour les
				// drainage est en faite le dépassement pour les 30 minutes.
				return 0;
			}
			return seancesTillEndOfYear(seancePerWeek);
		}
	},
	// Palliatif à domicile
	{
		seance_gen_nombre(lieu, { seancePerWeek }) {
			return seancesTillEndOfYear(seancePerWeek);
		},
		seances_normales_executables(lieu, { seancePerWeek }) {
			// Attention les 2eme séance par jour ne peuvent être attestée que pour les
			// patient BIM ET doit avoir un motif clair et disponible pour le medecin
			// conseil
			return seancesTillEndOfYear(seancePerWeek);
		}
	},
	// Hopital
	{
		seance_gen_nombre(lieu, { seancePerWeek }) {
			return seancesTillEndOfYear(seancePerWeek);
		},
		seances_normales_executables(lieu, { seancePerWeek }) {
			return seancesTillEndOfYear(seancePerWeek);
		}
	}
];
