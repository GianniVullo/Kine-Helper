export const maxLegalNumberSeance = [
	// Pathologie courante
	{
		seances_normales_executables(duree) {
			if (duree == 1) {
				// 20min
				return 18;
			} else if (duree == 2) {
				// 30min
				return 9;
			} else {
				return 365; // 15 min et c'est en Hopital donc illimité
			}
		},
		seances_en_depassement_executables(duree) {
			if (duree == 1) {
				// 20min
				return 54;
			} else if (duree == 2) {
				// 30min
				return 9;
			} else {
				return 0;
			}
		},
		seances_en_surdepassement_executables(duree) {
			if (duree == 1) {
				// 20min
				return 0; // (Il n'y a pas de surchargement)
			} else if (duree == 2) {
				return 54;
			} else {
				return 0;
			}
		}
	},
	// Pathologie lourde
	{
		seances_normales_executables(duree, additionals) {
			if (duree == 0) {
				return 0; // 2eme Séances dans la journée => sont ajoutées à la 1ère
			} else if (duree == 3) {
				// 45 min, doi être explicitement mentionnée sur la prescription
				return 50;
			} else if (duree == 4 || duree == 5) {
				// 60 et 120 minutes
				if ([3, 4].contains(additionals['seanceGenPathoLourde'])) {
					// Que ce soit 60 ou 120 min c'est 120 séances/an autorisées
					return 120;
				} else if (additionals['seanceGenPathoLourde'] == 2) {
					// Si le patient est dans son 21ième anniversaire
					if (DateTime.now().year - additionals['patient_BD_year'] > 21) {
						if (additionals['GMFCS'] > 3) {
							return 200;
						} else if (additionals['GMFCS'] > 1) {
							return 150;
						} else {
							return 100;
						}
					}
				} else {
					// si il s'agit des séances de 60 minutes au global pour les pathos du volet J)
					return 30; // /!\ il s'agit de 10/prescriptions
				}
				// Sinon la limite est celle fixée par les besoins du traitement.
			} else {
				// pour les 20 et 30 minutes
				return 365;
			}
			return 365;
		}
	},
	// Seconde Seance par jour
	{
		seances_normales_executables(duree, additional_info) {
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
		seances_normales_executables(duree, additional_info) {
			return 9;
		}
	},
	// Fa
	{
		seances_normales_executables(duree, additional_info) {
			if (duree == 1) {
				// Pour les séance de 20 minutes au MR psycho etc...
				if (additional_info['A-situation_pathologique'] == 17) {
					// pour le cas des polytraumatisés (Onglet J)
					return 120;
				}
				return 60;
			} else if (duree == 2) {
				return 20;
			} else {
				return 0;
			}
		},

		seances_en_depassement_executables(duree, additional_info) {
			if (duree == 1) {
				return 0;
			} else if (duree == 2) {
				// 30 minutes
				if (additional_info['A-situation_pathologique'] == 17) {
					// pour le cas des polytraumatisés (Onglet J)
					return 100;
				}
				return 40;
			} else {
				return 0;
			}
		},

		seances_en_surdepassement_executables(duree, additional_info) {
			if (duree == 1) {
				return 0;
			} else if (duree == 2) {
				return 365;
			} else {
				return 0;
			}
		}
	},
	// Fb
	{
		seances_normales_executables(duree, additional_info) {
			return 60;
		},
		seances_en_depassement_executables(duree, additional_info) {
			// Ici il y a une variante : les drainages lymphatiques n'ont pas de
			// dépassement. Le kiné effectue 60 drainages de 45 minutes puis il y a
			// les codes normaux de 30minutes.
			if (additional_info['seanceGenDrainage']) {
				return 0;
			}
			return 20;
		},
		seances_en_surdepassement_executables(duree, additional_info) {
			if (additional_info['seanceGenDrainage']) {
				// :/!\ le dépassement pour les
				// drainage est en faite le dépassement pour les 30 minutes.
				return 0;
			}
			return 365;
		}
	},
	// Palliatif à domicile
	{
		seances_normales_executables(duree, additional_info) {
			// Attention les 2eme séance par jour ne peuvent être attestée que pour les
			// patient BIM ET doit avoir un motif clair et disponible pour le medecin
			// conseil
			return 365;
		}
	},
	// Hopital
	{
		seances_normales_executables(duree, additional_info) {
			return 365;
		}
	}
];
