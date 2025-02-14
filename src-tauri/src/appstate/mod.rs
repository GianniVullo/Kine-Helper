use std::sync::Mutex;

use serializers::{Session, User};

mod serializers;

#[derive(Default, Clone, serde::Deserialize, serde::Serialize)]
pub struct AppState {
    pub stronghold_key: Option<String>,
    pub user: Option<User>,
    pub session: Option<Session>,
    pub db: Option<String>,
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
    println!("In the set_app_state with dbPath = {}", db);
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
