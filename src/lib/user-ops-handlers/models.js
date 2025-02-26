import { appState } from '../managers/AppState.svelte';

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
		this.user_id = appState.user.id;
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
		this.actif = actif ? JSON.parse(actif) : true;
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
		metadata,
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
		console.log('in the sp constructor');
		
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
		this.metadata = metadata;
		this.user_id = appState.user.id;
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

export class FacturePatient {}

export class FactureMutuelle {}

export class DemandeAccord {}

export class CustomDocument {}
