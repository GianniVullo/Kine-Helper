export const groupes = [
	'Pathologies Courantes',
	'Pathologies Lourdes',
	'Pathologies à 2 séances par jour',
	'Grossesse et Post-Partum',
	'Liste Fa',
	'Liste Fb',
	'Patients Palliatifs à domicile',
	'Hôpital de jour non concernés par ces dispositions',
	'Indemnités de déplacement par groupe',
	'Forfait genou/hanche par application mobile'
];

export const lieux = [
	'1a) Cabinet hors hopital',
	'1b) Cabinet dans hopital',
	'1c) Cabinet dans service médicalisé',
	'2) Domicile',
	'3a) Résidence communautaire',
	'3b) Maison de soins psychiatriques',
	'4) Hopital',
	'5) Centre de rééducation',
	'6) Maison de repos'
];

export const lieuxParGroupe = [
	['*'], // Pathologie courante peut s'effectuer dans tous les lieux
	['*'], // Pathologie Lourde fonctionne autrement
	[], // Pathologie à deux séances par jour fonctionne autrement
	[0, 1, 2, 3, 4, 5, 6, 7], // Grossesses et Post-partum (Sans maison de repos Obviously)
	[0, 1, 2, 3, 4, 5, 7, 8], // Fa (Pas en Hopital)
	[0, 1, 2, 3, 4, 5, 7, 8], // Fb (Pas en Hopital)
	[3], // Palliatif à domicile
	[6] // Hopital de jour
];

// Liste de JSO avec en clé les lieux (transformé en array par la méthode .split(",")) et en valeur leurs durées associées. cf: dureeObject...() ci après
export const dureeParGroupeParLieu = [
	{ '0,1,2,3,7': [2], '4,5,8': [1], 6: [0] }, // Pathologie Courante
	null, // Fonctionne autrement (Patholourde)
	null, // Fonctionne autrement (SecondeSeance)
	{ '0,1,2,3,6,7': [2], '4,5': [1] }, // Grossesse et Post-Partum (seulement 30 ou 20 min flavoured)
	{ '0,1,2,3,7': [2], '4,5,8': [1] }, // Fa (sauf hopital)
	{ '0,1,2,3,7': [2, 3], '4,5,8': [1, 3] }, // Fb (sauf hopital)
	{ 3: [2] }, // Palliatif à domicile
	{ 6: [0] } // Hopital de jour

	//! Hopital de jour il y avait un truc qui n'allait pas dans mon code originel genre j'avais ouublié d'ajouter la subtilité AMB/HOS ou un truc du genre
];

// il est nécessaire de filtrer en fonction du groupe et du lieu sélectionnés
export function dureeObjectSplittingPerLieu(group, lieu) {
	// D'abord trouver la ou les durées avec le groupe et le lieu
	let groupDurees = dureeParGroupeParLieu[group];
	let duree;
	for (const groupDureesKey of Object.keys(groupDurees)) {
		console.log(groupDureesKey);
		// Transformer la clé en liste
		let lieuxInner = groupDureesKey.split(',');
		console.log(lieuxInner);
		console.log(
			`in dureeObjectSplittingPerLieu loop with lieux == ${lieuxInner} and lieu == ${lieu} `
		);
		let isInKey = lieuxInner.includes(`${lieu}`);
		console.log(isInKey);
		if (isInKey) {
			duree = groupDurees[groupDureesKey];
			break;
		}
	}
	console.log(`in dureeObjectSplittingPerLieu(${group}, ${lieu}) with ${duree} (duree)`);
	return duree;
}
export const durees = [
	'15 minutes',
	'20 minutes',
	'30 minutes',
	'45 minutes',
	'60 minutes',
	'120 minutes'
];
export const types = [
	'Séance normale',
	'Dépassement',
	'Dépassement 2',
	'Rapport écrit',
	'À titre consultatif',
	'2ème séance dans la journée',
	'Intake à la 1ère séance d’un traitement'
];
