pub struct User {
    pub id: String,
    pub aud: String,
    pub role: String,
    pub email: String,
    pub email_confirmed_at: String,
    pub phone: String,
    pub confirmed_at: String,
    pub recovery_sent_at: String,
    pub last_sign_in_at: String,
    pub app_metadata: AppMetadata,
    pub user_metadata: UserMetadata,
    pub identities: Vec<Identity>,
    pub created_at: String,
    pub updated_at: String,
    pub is_anonymous: bool,
    pub user_id: String,
    pub nom: String,
    pub prenom: String,
    pub inami: String,
    pub bce: String,
    pub iban: String,
    pub adresse: String,
    pub cp: u16,
    pub localite: String,
    pub conventionne: String,
    pub offre: String,
    pub has_stronghold_key: bool,
    pub hold_exists: bool,
}

pub struct Session {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: u16,
    pub expires_at: u32,
    pub refresh_token: String,
}

pub struct Identity {
    pub identity_id: String,
    pub id: String,
    pub user_id: String,
    pub identity_data: IdentityData,
    pub provider: String,
    pub last_sign_in_at: String,
    pub created_at: String,
    pub updated_at: String,
    pub email: String,
}

pub struct IdentityData {
    pub email: String,
    pub sub: String,
}

pub struct AppMetadata {
    pub provider: String,
    pub providers: Vec<String>,
}

pub struct UserMetadata {}
