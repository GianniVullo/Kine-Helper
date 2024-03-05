#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Patient {
    pub nom: String,
    pub prenom: String,
    pub mutualite: String,
    pub niss: String,
    pub adresse: String,
    pub cp: String,
    pub localite: String,
}

impl Patient {
    pub fn full_name(&self) -> String {
        format!("{} {}", self.prenom, self.nom)
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Prescription {
    pub prescripteur: Prescripteur,
    pub date: String,
    pub jointe_a: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Prescripteur {
    pub nom: String,
    pub prenom: String,
    pub inami: String,
}

impl Prescripteur {
    pub fn full_name(&self) -> String {
        format!("{} {}", self.prenom, self.nom)
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Seance {
    pub date: String,
    pub code_reference: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Attestation {
    pub porte_prescr: bool,
    pub total_recu: String,
    pub date: String,
    pub seances: Vec<Seance>,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Kine {
    pub nom: String,
    pub prenom: String,
    pub inami: String,
    pub adresse: String,
    pub cp: String,
    pub localite: String,
    pub numero_bce: String,
}

impl Kine {
    pub fn full_name(&self) -> String {
        format!("{} {}", self.prenom, self.nom)
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct SituationPathologique {
    pub numero_etablissement: String,
    pub service: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct DocumentFormData {
    pub patient: Patient,
    pub prescription: Prescription,
    pub attestation: Attestation,
    pub kine: Kine,
    pub situation_pathologique: SituationPathologique,
    pub is_nine_pin: bool,
}
