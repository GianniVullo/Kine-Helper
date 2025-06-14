import { get, writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import { user } from './UserStore';

export class Patient {
	constructor({
		patient_id,
		created_at,
		nom,
		prenom,
		niss,
		adresse,
		cp,
		localite,
		date_naissance,
		tel,
		gsm,
		email,
		sexe,
		mutualite,
		num_affilie,
		tiers_payant,
		ticket_moderateur,
		bim,
		actif,
		numero_etablissement,
		service
	}) {
		this.patient_id = patient_id;
		this.created_at = created_at;
		this.nom = nom;
		this.prenom = prenom;
		this.niss = niss;
		this.adresse = adresse;
		this.cp = cp;
		this.localite = localite;
		this.date_naissance = date_naissance;
		this.tel = tel;
		this.gsm = gsm;
		this.email = email;
		this.sexe = sexe;
		this.mutualite = mutualite;
		this.num_affilie = num_affilie;
		this.tiers_payant = JSON.parse(tiers_payant);
		this.ticket_moderateur = JSON.parse(ticket_moderateur);
		this.bim = JSON.parse(bim);
		this.actif = JSON.parse(actif ?? null);
		this.numero_etablissement = numero_etablissement;
		this.service = service;
		this.situations_pathologiques = [];
	}

	addSP(sp) {
		this.situations_pathologiques.push(new SituationPathologique(sp));
	}

	does_prescription_have_generator(prescription_id) {}
}

export class SituationPathologique {
	constructor({
		sp_id,
		created_at,
		patient_id,
		numero_etablissement,
		service,
		motif,
		plan_du_ttt,
		intake,
		rapport_ecrit,
		rapport_ecrit_date,
		rapport_ecrit_custom_date,
		with_indemnity,
		groupe_id,
		patho_lourde_type,
		lieu_id,
		duree,
		volet_j,
		volet_h,
		gmfcs,
		seconde_seance_fa,
		seconde_seance_e,
		duree_seconde_seance_fa,
		deja_faites,
		date_presta_chir_fa,
		generateurs_de_seances = [],
		prescriptions = [],
		attestations = [],
		documents = [],
		seances = []
	}) {
		this.sp_id = sp_id;
		this.created_at = created_at;
		this.patient_id = patient_id;
		this.numero_etablissement = numero_etablissement;
		this.service = service;
		this.motif = motif;
		this.plan_du_ttt = plan_du_ttt;
		this.generateurs_de_seances = generateurs_de_seances;
		this.seances = seances;
		this.prescriptions = prescriptions;
		this.attestations = attestations;
		this.documents = documents;
		this.user_id = get(user).user.id;
		this.upToDate = false;
		this.intake = JSON.parse(intake ?? null);
		this.rapport_ecrit = JSON.parse(rapport_ecrit ?? null);
		this.rapport_ecrit_date = rapport_ecrit_date;
		this.rapport_ecrit_custom_date = rapport_ecrit_custom_date;
		this.with_indemnity = JSON.parse(with_indemnity ?? null);
		this.groupe_id = groupe_id;
		this.lieu_id = lieu_id;
		this.duree = duree;
		this.volet_j = JSON.parse(volet_j ?? null);
		this.volet_h = JSON.parse(volet_h ?? null);
		this.gmfcs = gmfcs;
		this.seconde_seance_fa = seconde_seance_fa;
		this.duree_seconde_seance_fa = duree_seconde_seance_fa;
		this.date_presta_chir_fa = date_presta_chir_fa;
		this.seconde_seance_e = seconde_seance_e;
		this.deja_faites = deja_faites;
		this.patho_lourde_type = patho_lourde_type;
		if (attestations) {
			for (const attestation of attestations) {
				attestation.with_indemnity = JSON.parse(attestation.with_indemnity);
				attestation.with_intake = JSON.parse(attestation.with_intake);
				attestation.has_been_printed = JSON.parse(attestation.has_been_printed);
				attestation.porte_prescr = JSON.parse(attestation.porte_prescr);
				attestation.with_rapport = JSON.parse(attestation.with_rapport);
				attestation.mutuelle_paid = JSON.parse(attestation.mutuelle_paid);
				attestation.patient_paid = JSON.parse(attestation.patient_paid);
			}
		}
		if (prescriptions) {
			for (const prescription of prescriptions) {
				prescription.prescripteur =
					typeof prescription.prescripteur === 'string'
						? JSON.parse(prescription.prescripteur)
						: prescription.prescripteur;
			}
		}
		if (documents) {
			for (const document of documents) {
				document.docType = parseInt(document.docType);
				document.form_data =
					typeof document.form_data === 'string'
						? JSON.parse(document.form_data)
						: document.form_data;
			}
		}
	}
	get factures() {
		return this.documents.filter((d) => [8, 9].includes(d.docType));
	}
	get toDB() {
		return {
			sp_id: this.sp_id,
			user_id: this.user_id,
			created_at: this.created_at,
			patient_id: this.patient_id,
			motif: this.motif,
			plan_du_ttt: this.plan_du_ttt,
			with_indemnity: this.with_indemnity,
			intake: this.intake,
			rapport_ecrit: this.rapport_ecrit,
			rapport_ecrit_date: this.rapport_ecrit_date,
			rapport_ecrit_custom_date: this.rapport_ecrit_custom_date,
			numero_etablissement: this.numero_etablissement,
			service: this.service
		};
	}
}

// function createPatientStore() {
// 	console.log('Initialized $patients with ');
// 	const { subscribe, update, set } = persisted('patients', [], {
// 		storage: 'session' // 'session' for sessionStorage, defaults to 'local'
// 	});

// 	const loading = writable(false);

// 	function sortPatient() {
// 		update((ps) => {
// 			ps.sort((a, b) => {
// 				if (a.nom > b.nom) {
// 					return 1;
// 				} else {
// 					return -1;
// 				}
// 			});
// 			return ps;
// 		});
// 	}

// 	function remove(patient_id) {
// 		console.log('in patients.remove(id) with', patient_id);
// 		update((ps) => {
// 			console.log('in patients.remove(id)>update with ps length BEFORE', ps.length);
// 			ps.splice(
// 				ps.findIndex((p) => p.patient_id == patient_id),
// 				1
// 			);
// 			console.log('in patients.remove(id)>update with ps length AFTER', ps.length);
// 			return ps;
// 		});
// 	}

// 	function getPatient(patient_id) {
// 		console.log('in getPatient() with', patient_id);
// 		if (patient_id == 'test-patient') {
// 			return defaultTestPatient();
// 		}
// 		return get({ subscribe }).find((p) => p.patient_id == patient_id);
// 	}

// 	function defaultTestPatient() {
// 		return {
// 			actif: true,
// 			adresse: 'Rue du test heureux, 251',
// 			bim: true,
// 			cp: 6000,
// 			created_at: '2023-08-25T17:50:11.422018+00:00',
// 			date_naissance: '1969-07-17',
// 			email: null,
// 			gsm: null,
// 			localite: 'Charleroi',
// 			mutualite: 216,
// 			niss: '12345612312',
// 			nom: 'Test',
// 			num_affilie: null,
// 			numero_etablissement: null,
// 			patient_id: 'test-patient',
// 			prenom: 'patient',
// 			service: null,
// 			sexe: 'M',
// 			situations_pathologiques: [
// 				{
// 					attestations: [
// 						{
// 							attestation_id: 'e549c550-f196-4274-8223-413e83b8f8d5',
// 							created_at: '2023-08-25T17:50:11.753503+00:00',
// 							date: '2022-12-23',
// 							has_been_printed: true,
// 							numero_etablissement: null,
// 							patient_id: 'test-patient',
// 							porte_prescr: true,
// 							prescription_id: '14a74ea8-9fb6-4f5b-acee-7bf09bed5285',
// 							service: null,
// 							sp_id: '0b017e35-2b9a-4462-8723-fa2740af5ca2',
// 							total_recu: 0,
// 							valeur_totale: 247.7,
// 							with_indemnity: true,
// 							with_intake: false
// 						}
// 					],
// 					created_at: '2023-08-25T17:50:11.555401+00:00',
// 					generateurs_de_seances: [](0),
// 					motif: 'Accident de moto',
// 					numero_etablissement: null,
// 					patient_id: 'test-patient',
// 					plan_du_ttt: 'Rééducation de la hanche',
// 					prescriptions: [
// 						{
// 							active: true,
// 							created_at: '2023-08-25T17:50:11.657441+00:00',
// 							date: '2022-11-03',
// 							file_path: null,
// 							jointe_a: '2022-11-24',
// 							patient_id: 'test-patient',
// 							prescripteur: { nom: '?', inami: '16764865-480', prenom: '?' },
// 							prescription_id: '14a74ea8-9fb6-4f5b-acee-7bf09bed5285',
// 							sp_id: '0b017e35-2b9a-4462-8723-fa2740af5ca2'
// 						}
// 					],
// 					seances: [
// 						{
// 							attestation_id: 'e549c550-f196-4274-8223-413e83b8f8d5',
// 							code_id: 'a3dada68-55cb-4a07-86b1-30c9d736c057',
// 							created_at: '2023-08-25T17:50:11.839361+00:00',
// 							description: 'null',
// 							end: null,
// 							has_been_attested: true,
// 							patient_id: 'test-patient',
// 							prescription_id: '14a74ea8-9fb6-4f5b-acee-7bf09bed5285',
// 							seance_id: '530463af-2ca6-4811-aa9f-594c9938c03c',
// 							sp_id: '0b017e35-2b9a-4462-8723-fa2740af5ca2',
// 							start: null
// 						}
// 					],
// 					service: null,
// 					sp_id: '0b017e35-2b9a-4462-8723-fa2740af5ca2'
// 				}
// 			],
// 			tel: null,
// 			ticket_moderateur: false,
// 			tiers_payant: true
// 		};
// 	}

// 	return {
// 		subscribe,
// 		update,
// 		set,
// 		loading,
// 		sortPatient,
// 		remove,
// 		getPatient
// 	};
// }

// export const patients = createPatientStore();
