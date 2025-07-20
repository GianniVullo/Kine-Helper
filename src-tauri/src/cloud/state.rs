use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Patients {
    // Patients are stored for each user_id
    pub patients: HashMap<String, Vec<Patient>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Patient {
    pub user_id: String,
    pub patient_id: String,
    pub created_at: Option<String>,
    pub nom: String,
    pub prenom: Option<String>,
    pub niss: Option<String>,
    pub adresse: Option<String>,
    pub cp: Option<i32>,
    pub localite: Option<String>,
    pub date_naissance: Option<String>,
    pub tel: Option<String>,
    pub gsm: Option<String>,
    pub email: Option<String>,
    pub sexe: Option<String>,
    pub mutualite: Option<i32>,
    pub num_affilie: Option<String>,
    pub tiers_payant: bool,
    pub ticket_moderateur: bool,
    pub bim: bool,
    pub actif: bool,
    pub numero_etablissement: Option<String>,
    pub service: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub situations_pathologiques: Option<Vec<SituationPathologique>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SituationPathologique {
    pub user_id: String,
    pub patient_id: String,
    pub sp_id: String,
    pub created_at: Option<String>,
    pub numero_etablissement: Option<String>,
    pub service: Option<String>,
    pub motif: String,
    pub plan_du_ttt: Option<String>,
    pub intake: bool,
    pub with_indemnity: bool,
    pub rapport_ecrit: bool,
    pub rapport_ecrit_custom_date: Option<String>,
    pub rapport_ecrit_date: Option<String>,
    pub groupe_id: i32,
    pub patho_lourde_type: Option<i32>,
    pub lieu_id: i32,
    pub duree: i32,
    pub volet_j: Option<bool>,
    pub volet_h: Option<bool>,
    pub gmfcs: Option<i32>,
    pub seconde_seance_fa: Option<bool>,
    pub seconde_seance_e: Option<bool>,
    pub duree_seconde_seance_fa: Option<i32>,
    pub deja_faites: Option<i32>,
    pub date_presta_chir_fa: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub amb_hos: Option<String>,
    pub prescriptions: Option<Vec<Prescription>>,
    pub seances: Option<Vec<Seance>>,
    pub attestations: Option<Vec<Attestation>>,
    pub accords: Option<Vec<Accord>>,
    pub factures: Option<Vec<Facture>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prescription {
    pub user_id: String,
    pub patient_id: String,
    pub sp_id: String,
    pub prescription_id: String,
    pub created_at: Option<String>,
    pub date: Option<String>,
    pub active: Option<bool>,
    pub jointe_a: Option<String>,
    pub prescripteur: Option<String>,
    pub nombre_seance: Option<i32>,
    pub seance_par_semaine: Option<i32>,
    pub file_name: Option<String>,
    pub deja_faites: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Seance {
    pub seance_id: String,
    pub user_id: String,
    pub patient_id: String,
    pub sp_id: String,
    pub prescription_id: String,
    pub attestation_id: String,
    pub code_id: String,
    pub created_at: Option<String>,
    pub date: String,
    pub description: Option<String>,
    pub has_been_attested: bool,
    pub is_paid: Option<bool>,
    pub start: String,
    pub end: Option<String>,
    pub gen_id: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    pub indemnite: Option<i32>,
    pub rapport_ecrit: Option<i32>,
    pub ticket_moderateur: Option<i32>,
    pub seance_type: Option<i32>,
    pub groupe_id: Option<i32>,
    pub lieu_id: Option<i32>,
    pub patho_lourde_type: Option<i32>,
    pub duree: Option<i32>,
    pub payment_method: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Attestation {
    pub user_id: String,
    pub patient_id: String,
    pub sp_id: String,
    pub prescription_id: String,
    pub attestation_id: String,
    pub created_at: Option<String>,
    pub porte_prescr: Option<bool>,
    pub numero_etablissement: Option<String>,
    pub service: Option<String>,
    pub has_been_printed: Option<bool>,
    pub total_recu: Option<f64>,
    pub valeur_totale: Option<f64>,
    pub with_indemnity: Option<bool>,
    pub with_intake: Option<bool>,
    pub date: Option<String>,
    pub with_rapport: Option<bool>,
    pub mutuelle_paid: Option<bool>,
    pub patient_paid: Option<bool>,
    pub numero: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Accord {
    pub user_id: String,
    pub patient_id: String,
    pub sp_id: String,
    pub id: String,
    pub date: Option<String>,
    pub situation: Option<String>,
    pub valid_from: Option<String>,
    pub valid_to: Option<String>,
    pub reference: Option<String>,
    pub buildable: Option<i32>,
    pub binary: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Facture {
    pub user_id: String,
    pub patient_id: String,
    pub sp_id: String,
    pub id: String,
    pub date: Option<String>,
    pub r#type: Option<String>,
    pub total: Option<String>,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tarif {
    pub user_id: String,
    pub id: String,
    pub created_at: Option<String>,
    pub nom: String,
    pub valeur: String,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}

pub struct Supplement {
    pub user_id: String,
    pub id: String,
    pub created_at: Option<String>,
    pub nom: String,
    pub valeur: String,
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}
