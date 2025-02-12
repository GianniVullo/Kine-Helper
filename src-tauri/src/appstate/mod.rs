use serializers::{Session, User};

mod serializers;

#[derive(Default)]
pub struct AppState {
    pub stronghold_key: Option<String>,
    pub user: Option<User>,
    pub session: Option<Session>,
}
