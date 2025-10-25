use std::collections::HashMap;

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct User {
    pub id: String,
    pub aud: Option<String>,
    pub role: Option<String>,
    pub email: Option<String>,
    pub email_confirmed_at: Option<String>,
    pub phone: Option<String>,
    pub confirmed_at: Option<String>,
    pub recovery_sent_at: Option<String>,
    pub last_sign_in_at: Option<String>,
    pub app_metadata: Option<AppMetadata>,
    pub user_metadata: Option<UserMetadata>,
    pub identities: Option<Vec<Identity>>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub is_anonymous: Option<bool>,
    pub user_id: Option<String>,
    pub nom: Option<String>,
    pub prenom: Option<String>,
    pub inami: Option<String>,
    pub bce: Option<String>,
    pub iban: Option<String>,
    pub adresse: Option<String>,
    pub cp: Option<u16>,
    pub localite: Option<String>,
    pub conventionne: Option<bool>,
    pub offre: Option<String>,
    pub has_stronghold_key: Option<bool>,
    pub hold_exists: Option<bool>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Session {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: u16,
    pub expires_at: u32,
    pub refresh_token: String,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Identity {
    pub identity_id: Option<String>,
    pub id: Option<String>,
    pub user_id: Option<String>,
    pub identity_data: Option<IdentityData>,
    pub provider: Option<String>,
    pub last_sign_in_at: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub email: Option<String>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct IdentityData {
    pub email: String,
    pub sub: String,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct AppMetadata {
    pub provider: String,
    pub providers: Vec<String>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct UserMetadata {}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Organization {
    pub id: String,
    pub selected: bool,
    pub name: String,
    pub slug: String,
    pub settings: Option<HashMap<String, String>>, // JSON Encoded for simplicity because I don't know yet the keys and values
    pub logo: Option<Vec<u8>>,
    pub created_at: String,
    pub updated_at: String,
    pub membres: Vec<Membre>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct Membre {
    pub email: Option<String>,
    pub phone: Option<String>,
    pub created_at: Option<String>,
    pub user_id: Option<String>,
    pub nom: Option<String>,
    pub prenom: Option<String>,
    pub inami: Option<String>,
    pub bce: Option<String>,
    pub iban: Option<String>,
    pub adresse: Option<String>,
    pub cp: Option<u16>,
    pub localite: Option<String>,
    pub conventionne: Option<bool>,
}
