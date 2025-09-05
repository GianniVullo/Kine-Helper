use log::warn;
use serializers::{Session, User};
use std::sync::Mutex;

mod serializers;

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct SAMLToken {
    pub raw_assertion_xml: String,
    pub not_on_or_after: String,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
pub struct EHealth {
    pub ssin: String,
    pub certificate: String,
    pub saml_token: Option<SAMLToken>,
}

#[derive(Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct AppState {
    pub stronghold_key: Option<String>,
    pub user: Option<User>,
    pub session: Option<Session>,
    pub db: Option<String>,
    pub e_health: Option<EHealth>,
}

#[tauri::command]
pub fn get_app_state(app_state: tauri::State<'_, Mutex<AppState>>) -> Result<AppState, String> {
    match app_state.lock() {
        Ok(state) => Ok(state.clone()),
        Err(err) => Err(format!(
            "Panic: cannot reatrive the appState from Mutex {}",
            err
        )),
    }
}

#[tauri::command]
pub fn set_app_state(
    app_state: tauri::State<'_, Mutex<AppState>>,
    user: User,
    session: Session,
    db: String,
) -> Result<bool, String> {
    warn!("Setting app state");
    let mut state = match app_state.lock() {
        Ok(state) => state,
        Err(err) => {
            return Err(format!(
                "Panic: cannot reatrive the appState from Mutex {}",
                err
            ))
        }
    };
    state.session = Some(session);
    state.user = Some(user);
    state.db = Some(db);
    Ok(true)
}

#[tauri::command]
pub fn set_e_health(
    app_state: tauri::State<'_, Mutex<AppState>>,
    e_health: EHealth,
) -> Result<bool, String> {
    warn!("Setting eHealth on app state");
    let mut state = match app_state.lock() {
        Ok(state) => state,
        Err(err) => {
            return Err(format!(
                "Panic: cannot reatrive the appState from Mutex {}",
                err
            ))
        }
    };
    state.e_health = Some(e_health);
    Ok(true)
}
