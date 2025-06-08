#[cfg(target_os = "macos")]
mod apple_api;

#[cfg(target_os = "windows")]
mod windows_api;

mod appstate;
mod cloud;
mod cryptage;
mod database_migrations;
#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
mod eid_reader;

mod nomenclature;
mod printer;
mod stability_corrections;

#[cfg(target_os = "macos")]
use apple_api::{get_scan, get_scanners, stop_browsing};
use appstate::AppState;

use cloud::jobs::Job;
use cloud::queue::{enqueue_job, run_queue, QueueState};
use nomenclature::convention_decompression;

#[cfg(target_os = "macos")]
use apple_api::state::ScanOperation;

#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::{pdf_printer::unix::print_pdf, raw_printer::unix::print_attestation};

#[cfg(target_os = "windows")]
use crate::windows_api::scanner_api::{get_scan, get_scanners};

#[cfg(target_os = "windows")]
use printer::{pdf_printer::windows::print_pdf, raw_printer::windows::print_attestation};

#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
use printers::{common::base::printer::Printer, get_printers};

// use apple_api::commands::start_list_scanners;
use appstate::{get_app_state, set_app_state};
use cryptage::{
    decrypt_string, does_private_key_exist, encrypt_string, from_base64_to_bytes,
    from_bytes_to_base64, generate_encryption_key, setup_stronghold_key,
};
use database_migrations::build_migrations;
#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
use eid_reader::get_eid_data;

use stability_corrections::{
    file_system_correction::perform_fs_stability_patch,
    macos_hardened_runtime_fs_correction::migrate_old_data_if_needed,
};
use std::sync::Mutex;
use std::{
    fs::{self, File},
    io::Write,
};
use tauri::Manager;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct LocalPrinter {
    pub name: String,
    pub uri: String,
    pub system_name: String,
    pub driver_name: String,
}

#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
impl From<Printer> for LocalPrinter {
    fn from(external: Printer) -> Self {
        LocalPrinter {
            name: external.name,
            uri: external.uri,
            system_name: external.system_name,
            driver_name: external.driver_name,
        }
    }
}

#[tauri::command]
fn setup_path(
    dir_path: String,
    file_path: String,
    file_content: Vec<u8>,
) -> Result<String, String> {
    println!(
        "Setting up path: directory -> {}, file -> {}",
        dir_path, file_path
    );

    // Create the directory and handle potential errors
    if let Err(e) = fs::create_dir_all(&dir_path) {
        return Err(format!(
            "Failed to create directory: {}. Error: {}",
            dir_path, e
        ));
    }

    // Create the file and handle potential errors
    let mut file = match File::create(&file_path) {
        Ok(f) => f,
        Err(e) => {
            return Err(format!(
                "Failed to create file: {}. Error: {}",
                file_path, e
            ))
        }
    };

    // Write to the file and handle potential errors
    if let Err(e) = file.write_all(&file_content) {
        return Err(format!(
            "Failed to write to file: {}. Error: {}",
            file_path, e
        ));
    }

    // Return success message
    Ok(format!("Successfully set up: {}", file_path))
}

#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
#[tauri::command]
async fn get_printer() -> Vec<LocalPrinter> {
    let printers = get_printers();
    println!("{:?}", &printers);
    let local_printers = printers.into_iter().map(|p| p.into()).collect();
    local_printers
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("launching");
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .filter(|metadata| metadata.target().starts_with("webview"))
                .build(),
        )
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            println!("Running Tauri Setup with {:?}", app);
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;
            println!("Registered plugin_updater");
            app.manage(Mutex::new(AppState::default()));
            println!("Registered AppState");
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

            #[cfg(target_os = "macos")]
            app.manage(std::sync::Arc::new(Mutex::new(None::<ScanOperation>)));
            println!("Registered ScanOperation state for macOS");

            // Ici je corrige le problème de stabilité du file système le prblm prevenait du faire que j'ai utilisé des variables que les utilisateurs peuvent modifier pour nommer le file system de Kiné Helper. En conséquence lorsque les utilisateurs modifient une de ces variables, le file system se désynchronise d'avec KH qui recrée une nouvelle structure perdant ansi l'accès à toutes les données précédentes. example: si le nom du patient était modifié l'utilisateur perdait l'accès au dossier du patient qui portait son nom.
            perform_fs_stability_patch(app);

            // Here I perform a correction in the file system on macos only because when I enabled the hardened runtime the default app_local_data_dir was moved to Containers/data/be.kine-helper.prod causing users to lose access to their data. This patch moves the data from the old location to the new one.
            #[cfg(target_os = "macos")]
            migrate_old_data_if_needed().expect("Failed to migrate old data");

            println!("Performed file system stability patch");
            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:kinehelper.db", build_migrations())
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![
            get_app_state,
            set_app_state,
            generate_encryption_key,
            does_private_key_exist,
            encrypt_string,
            decrypt_string,
            from_base64_to_bytes,
            from_bytes_to_base64,
            setup_stronghold_key,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            get_eid_data,
            convention_decompression,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            print_attestation,
            setup_path,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            get_printer,
            get_scanners,
            get_scan,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            print_pdf,
            #[cfg(target_os = "macos")]
            stop_browsing,
            enqueue_job
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |app, event| {
            if let tauri::RunEvent::ExitRequested { code, api, .. } = event {
                println!("Exit requested with code: {}", {
                    if let Some(exit_code) = code {
                        exit_code.to_string()
                    } else {
                        "Code couldn't be unwrapped".to_string()
                    }
                });
                println!("API: {:?}", api);

                // Spawn an async block to drop sender and wait for queue
                let app_handle = app.clone();
                let (tx, rx) = tokio::sync::oneshot::channel();
                let _exiting_thread_handle = tauri::async_runtime::spawn(async move {
                    if let Some(queue_state) = app_handle.try_state::<QueueState>() {
                        // Drop the sender (signal shutdown)
                        let mut sender_guard = queue_state.sender.lock().await;
                        if sender_guard.take().is_some() {
                            println!("Sender dropped.");
                        }

                        let mut handle_guard = queue_state.join_handle.lock().await;
                        if let Some(handle) = handle_guard.take() {
                            // Wait for the queue to finish processing
                            if let Err(e) = handle.await {
                                // TODO : here we should at least store the error in a dedicated database table so that we can inform the user on what went wrong when he gets back. For the cloud users we could even store the error on the server to inform him wherever he connects from the next time.
                                eprintln!("Error while waiting for queue: {:?}", e);
                            } else {
                                // If everything went well then, bye bye
                                println!("Queue finished processing.");
                            }
                        } else {
                            println!("Join handle already dropped.");
                        }
                    }
                    println!("Exiting application...");
                    let _ = tx.send(());
                });
                rx.blocking_recv().expect("Failed to receive exit signal");
            }
        });
}
