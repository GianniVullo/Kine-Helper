use std::sync::Mutex;

use serializers::{Session, User};

mod serializers;

#[derive(Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct AppState {
    pub stronghold_key: Option<String>,
    pub user: Option<User>,
    pub session: Option<Session>,
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
