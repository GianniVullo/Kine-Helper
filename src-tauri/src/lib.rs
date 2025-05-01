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

use nomenclature::convention_decompression;
use std::thread::sleep;

#[cfg(target_os = "macos")]
use apple_api::state::ScanOperation;

#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::{pdf_printer::unix::print_pdf, raw_printer::unix::print_attestation};

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

use stability_corrections::file_system_correction::perform_fs_stability_patch;
use std::sync::Mutex;
use std::time::Duration;
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
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .filter(|metadata| metadata.target().starts_with("webview"))
                .build(),
        )
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;
            app.manage(Mutex::new(AppState::default()));

            #[cfg(target_os = "macos")]
            app.manage(std::sync::Arc::new(Mutex::new(None::<ScanOperation>)));

            // Ici je corrige le problème de stabilité du file système le prblm prevenait du faire que j'ai utilisé des variables que les utilisateurs peuvent modifier pour nommer le file system de Kiné Helper. En conséquence lorsque les utilisateurs modifient une de ces variables, le file system se désynchronise d'avec KH qui recrée une nouvelle structure perdant ansi l'accès à toutes les données précédentes. example: si le nom du patient était modifié l'utilisateur perdait l'accès au dossier du patient qui portait son nom.
            perform_fs_stability_patch(app);
            Ok(())
        })
        .on_menu_event(|app, event| {
            println!("Menu event: {:?}", event);
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
            #[cfg(target_os = "macos")]
            get_scanners,
            #[cfg(target_os = "macos")]
            get_scan,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            print_pdf,
            #[cfg(target_os = "macos")]
            stop_browsing,
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
                println!("Sleeping 10 seconds before exiting application...");
                sleep(Duration::from_secs(10));
                // Perform any cleanup or finalization here
                println!("Exiting application...");
            }
        });
}
