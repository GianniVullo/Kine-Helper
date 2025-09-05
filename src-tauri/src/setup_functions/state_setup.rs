use std::sync::Mutex;

use tauri::{App, Manager};

use crate::{
    appstate::AppState,
    cloud::{
        jobs::Job,
        queue::{run_queue, QueueState},
    },
};

pub fn setup_app_state(app: &mut App) {
    app.manage(Mutex::new(AppState::default()));
}

pub fn setup_job_queue_and_state(app: &mut App) {
    let (tx, rx) = tokio::sync::mpsc::channel::<Job>(100);
    println!("Created channel for job queue");
    let join_handle = tauri::async_runtime::spawn(run_queue(rx, app.handle().clone()));
    println!("Spawned job queue handler");
    let queue_state = QueueState {
        sender: tokio::sync::Mutex::new(Some(tx)),
        join_handle: tokio::sync::Mutex::new(Some(join_handle)),
    };
    println!("Created QueueState with sender and join_handle");
    app.manage(queue_state);
    println!("Registered QueueState in app state");
}

#[cfg(target_os = "macos")]
pub fn setup_macos_scanner_app_state(app: &mut App) {
    use crate::apple_api::state::ScanOperation;

    app.manage(std::sync::Arc::new(Mutex::new(None::<ScanOperation>)));
    println!("Registered ScanOperation state for macOS");
}
