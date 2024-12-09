import { get } from 'svelte/store';
import { t } from '../i18n/index';
import dayjs from 'dayjs';

export class Code {
	constructor({
		code_id,
		duree,
		lieu,
		honoraire,
		remboursement,
		groupe,
		type,
		drainage,
		valeur,
		coefficient,
		code_reference,
		amb_hos,
		lourde_type,
		convention_id
	}) {
		this.code_id = code_id;
		this.duree_id = duree;
		this.lieu_id = lieu;
		this.honoraire = honoraire;
		this.remboursement = JSON.parse(remboursement);
		this.groupe_id = groupe;
		this.type_id = type;
		this.drainage = JSON.parse(drainage);
		this.valeur = valeur;
		this.coefficient = coefficient;
		this.code_reference = code_reference;
		this.convention_id = convention_id;
		this.amb_hos = amb_hos;
		this.lourde_type_id = lourde_type;
	}

	get duree() {
		return durees()[this.duree_id];
	}
	get lieu() {
		return lieux()[this.lieu_id];
	}
	get groupe() {
		return groupes()[this.groupe_id];
	}
	get type() {
		return types()[this.type_id];
	}
	get lourde_type() {
		return patholourdeTypes()[this.lourde_type];
	}

	get duree_min_int() {
		switch (this.duree_id) {
			case 0:
				return 15;
			case 1:
				return 20;
			case 2:
				return 30;
			case 3:
				return 45;
			case 4:
				return 60;
			case 5:
				return 120;
			default:
				break;
		}
	}
}

/**
 *!  Par chance, une réécriture bcp plus simple de figuringConventionsOut est possible.
 ** La complexité de la précédente écriture provient du fait que j'ignorais l'existence de la fonction date() de SQLite.
 ** Cette réécriture tient dans une seule query :
*/
export async function figuringConventionOut(date, db) {
	return await db.select(
		`SELECT c.*
		FROM codes AS c
		INNER JOIN conventions AS con ON c.convention_id = con.convention_id
		WHERE DATE(con.created_at) = (
			SELECT MAX(DATE(con2.created_at))
			FROM conventions AS con2
			WHERE DATE(con2.created_at) <= DATE($1)
		);`,
		[date]
	);
}
export function groupes() {
	return [
		get(t)('stores', 'code.grp1'),
		get(t)('stores', 'code.grp2'),
		get(t)('stores', 'code.grp3'),
		get(t)('stores', 'code.grp4'),
		get(t)('stores', 'code.grp5'),
		get(t)('stores', 'code.grp6'),
		get(t)('stores', 'code.grp7'),
		get(t)('stores', 'code.grp8'),
		get(t)('stores', 'code.grp9'),
		get(t)('stores', 'code.grp10')
	];
}

export function lieux() {
	return [
		get(t)('stores', 'code.l1'),
		get(t)('stores', 'code.l2'),
		get(t)('stores', 'code.l3'),
		get(t)('stores', 'code.l4'),
		get(t)('stores', 'code.l5'),
		get(t)('stores', 'code.l6'),
		get(t)('stores', 'code.l7'),
		get(t)('stores', 'code.l8'),
		get(t)('stores', 'code.l9')
	];
}

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
export function durees() {
	return [
		`15 ${get(t)('shared', 'minutes')}`,
		`20 ${get(t)('shared', 'minutes')}`,
		`30 ${get(t)('shared', 'minutes')}`,
		`45 ${get(t)('shared', 'minutes')}`,
		`60 ${get(t)('shared', 'minutes')}`,
		`120 ${get(t)('shared', 'minutes')}`
	];
}
export function types() {
	return [
		get(t)('stores', 'code.t1'),
		get(t)('stores', 'code.t2'),
		get(t)('stores', 'code.t3'),
		get(t)('stores', 'code.t4'),
		get(t)('stores', 'code.t5'),
		get(t)('stores', 'code.t6'),
		get(t)('stores', 'code.t7')
	];
}

export function patholourdeTypes() {
	return [
		get(t)('stores', 'code.plt1'), // "Séance normale (20 ou 30 minutes)",
		get(t)('stores', 'code.plt2'), // "Patient IMC (60 min)",
		get(t)('stores', 'code.plt3'), // "Drainage 60 min",
		get(t)('stores', 'code.plt4'), // "Drainage 120 min",
		get(t)('stores', 'code.plt5'), // "Séance de 45 min après le séjour du bénéficiaire en hôpital ou en centre de revalidation (phase subaiguë). Pour les volets a), c) ou d) uniquement",
		get(t)('stores', 'code.plt6') // "Séance de 60 min au global avec minimum 2 périodes distinctes<br>Pour le volet j) uniquement"
	];
}

export const indmeniteCategory = [
	'639170',
	'639133',
	'639170',
	'639170',
	'639192',
	'639155',
	'639111',
	'639170',
	'639170' //,
	// indemnité de déplacement par groupe
];

export const SEANCE_NORMALE = 0;
export const DEPASSEMENT = 1;
export const DEPASSEMENT2 = 2;
export const RAPPORT_ECRIT = 3;
export const EXAMEN_A_TITRE_CONSULTATIF = 4;
export const SECONDE_SEANCE = 5;
export const INTAKE = 6;
