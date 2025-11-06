import { payment_methods } from '../components/forms/schemas/SeanceSchema.svelte';
import { safeBooleanJsonParse } from '../cloud/database';
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
		this.tiers_payant = safeBooleanJsonParse(tiers_payant);
		this.ticket_moderateur = safeBooleanJsonParse(ticket_moderateur);
		this.bim = safeBooleanJsonParse(bim);
		this.actif = actif ? safeBooleanJsonParse(actif) : true;
		this.numero_etablissement = numero_etablissement;
		this.service = service;
		this.situations_pathologiques = [];
	}

	get is_complete() {
		return this.nom && this.niss && this.adresse && this.cp && this.localite && this.mutualite;
	}

	get missing_fields() {
		const fields = {
			Nom: this.nom && this.nom.length > 0,
			Niss: this.niss && this.niss.length > 0,
			Adresse: this.adresse && this.adresse.length > 0,
			'Code postal': typeof this.cp === 'number',
			Localite: this.localite && this.localite.length > 0,
			Mutualité: typeof this.mutualite == 'number'
		};
		return Object.keys(fields).filter((key) => !fields[key]);
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
		amb_hos,
		seconde_seance_fa,
		seconde_seance_e,
		duree_seconde_seance_fa,
		deja_faites,
		date_presta_chir_fa,
		generateurs_de_seances = [],
		prescriptions = [],
		attestations = [],
		accords = [],
		factures = [],
		seances = []
	}) {
		console.log('in the sp constructor with', accords, factures);

		this.sp_id = sp_id;
		this.created_at = created_at;
		this.patient_id = patient_id;
		this.amb_hos = amb_hos;
		this.numero_etablissement = numero_etablissement;
		this.service = service;
		this.motif = motif;
		this.plan_du_ttt = plan_du_ttt;
		this.generateurs_de_seances = generateurs_de_seances;
		this.seances = seances.map((s) => new Seance(s));
		this.accords = accords;
		this.factures = factures;
		this.metadata = metadata ? JSON.parse(metadata) : {};
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
		this.factures_attestations = [];
		if (attestations) {
			for (const attestation of attestations) {
				attestation.with_indemnity = JSON.parse(attestation.with_indemnity);
				attestation.with_intake = JSON.parse(attestation.with_intake);
				attestation.has_been_printed = JSON.parse(attestation.has_been_printed);
				attestation.porte_prescr = JSON.parse(attestation.porte_prescr);
				attestation.with_rapport = JSON.parse(attestation.with_rapport);
				attestation.mutuelle_paid = JSON.parse(attestation.mutuelle_paid);
				attestation.patient_paid = JSON.parse(attestation.patient_paid);
				if (attestation.factures_attestations) {
					for (const f_as of attestation.factures_attestations) {
						this.factures_attestations.push({
							facture_id: f_as.facture_id,
							attestation_id: attestation.attestation_id,
							user_id: attestation.user_id,
							organization_id: attestation.organization_id
						});
					}
					delete attestation.factures_attestations;
				}
			}
		}
		this.attestations = attestations;
		if (prescriptions) {
			for (const prescription of prescriptions) {
				prescription.prescripteur =
					typeof prescription.prescripteur === 'string'
						? JSON.parse(prescription.prescripteur)
						: prescription.prescripteur;
			}
		}
		this.prescriptions = prescriptions;
	}

	// get factures() {
	// 	return this.documents.filter((d) => [8, 9].includes(d.docType));
	// }
	get toDB() {
		return {
			user_id: appState.user.id,
			patient_id: this.patient_id,
			sp_id: this.sp_id,
			created_at: this.created_at,
			numero_etablissement: this.numero_etablissement,
			service: this.service,
			motif: this.motif,
			plan_du_ttt: this.plan_du_ttt,
			intake: this.intake,
			with_indemnity: this.with_indemnity,
			rapport_ecrit: this.rapport_ecrit,
			rapport_ecrit_custom_date: this.rapport_ecrit_custom_date,
			rapport_ecrit_date: this.rapport_ecrit_date,
			groupe_id: this.groupe_id,
			patho_lourde_type: this.patho_lourde_type,
			lieu_id: this.lieu_id,
			duree: this.duree,
			volet_j: this.volet_j,
			volet_h: this.volet_h,
			gmfcs: this.gmfcs,
			seconde_seance_fa: this.seconde_seance_fa,
			seconde_seance_e: this.seconde_seance_e,
			duree_seconde_seance_fa: this.duree_seconde_seance_fa,
			deja_faites: this.deja_faites,
			date_presta_chir_fa: this.date_presta_chir_fa,
			metadata: this.metadata,
			amb_hos: this.amb_hos
		};
	}
}

export class Seance {
	constructor({
		patient_id,
		user_id,
		sp_id,
		seance_id,
		start,
		date,
		metadata,
		created_at,
		code_id,
		attestation_id,
		prescription_id,
		has_been_attested,
		is_paid,
		payment_method,
		indemnite,
		rapport_ecrit,
		ticket_moderateur,
		seance_type,
		groupe_id,
		lieu_id,
		patho_lourde_type,
		duree
	}) {
		this.patient_id = patient_id;
		this.user_id = user_id;
		this.sp_id = sp_id;
		this.seance_id = seance_id;
		this.start = start;
		this.date = date;
		this.indemnite = JSON.parse(indemnite);
		this.rapport_ecrit = JSON.parse(rapport_ecrit);
		this.ticket_moderateur = JSON.parse(ticket_moderateur);
		this.seance_type = seance_type;
		this.groupe_id = groupe_id;
		this.lieu_id = lieu_id;
		this.patho_lourde_type = patho_lourde_type;
		this.duree = duree;
		if (typeof metadata === 'string') {
			console.log('metadata', metadata);
			this.metadata = JSON.parse(metadata);
		} else if (typeof metadata === 'object') {
			this.metadata = metadata;
		} else {
			this.metadata = null;
		}
		this.created_at = created_at;
		this.code_id = code_id;
		this.attestation_id = attestation_id;
		this.prescription_id = prescription_id;
		this.has_been_attested = has_been_attested;
		if (typeof this.has_been_attested === 'string') {
			this.has_been_attested = JSON.parse(this.has_been_attested);
		}
		this.is_paid = JSON.parse(is_paid);
		this.payment_method = payment_methods[payment_method];
	}
	get minutes() {
		switch (this.duree) {
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

export class FacturePatient {}

export class FactureMutuelle {}

export class DemandeAccord {}

export class CustomDocument {}
