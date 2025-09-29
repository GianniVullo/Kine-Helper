#[cfg(target_os = "macos")]
mod apple_api;

#[cfg(target_os = "windows")]
mod windows_api;

mod appstate;
mod cloud;
mod cryptage;

mod database_migrations;

#[cfg(desktop)]
mod eid_reader;
mod setup_functions;

mod nomenclature;

#[cfg(desktop)]
mod printer;
#[cfg(desktop)]
mod stability_corrections;

#[cfg(desktop)]
use setup_functions::desktop::CustomInit;

#[cfg(mobile)]
use setup_functions::mobile::CustomInit;

#[cfg(target_os = "macos")]
use apple_api::{get_scan, get_scanners, stop_browsing};

use cloud::{deflate_and_encode, image_compression::compress_img_at_path, queue::enqueue_job};
use nomenclature::convention_decompression;

#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::{pdf_printer::unix::print_pdf, raw_printer::unix::print_attestation};
use tauri::{Builder, EventLoopMessage, Runtime, Wry};

#[cfg(target_os = "windows")]
use crate::windows_api::scanner_api::{get_scan, get_scanners};

#[cfg(target_os = "windows")]
use printer::{pdf_printer::windows::print_pdf, raw_printer::windows::print_attestation};

#[cfg(desktop)]
use printers::{common::base::printer::Printer, get_printers};

// use apple_api::commands::start_list_scanners;
use appstate::{get_app_state, set_app_state, set_e_health, set_organizations};
use cryptage::{
    decrypt_string, does_private_key_exist, encrypt_string, from_base64_to_bytes,
    from_bytes_to_base64, generate_encryption_key, setup_stronghold_key,
};
#[cfg(desktop)]
use eid_reader::{
    get_b64_certificate, get_eid_data, sha256_hash_base64, sha256_hash_bytes, sign_eid_data,
};

#[cfg(desktop)]
use stability_corrections::{
    file_system_correction::perform_fs_stability_patch,
    // macos_hardened_runtime_fs_correction::migrate_old_data_if_needed,
};
use std::{
    fs::{self, File},
    io::Write,
};

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

#[cfg(desktop)]
fn setup_desktop() {
    let builder = tauri::Builder::default();
    builder
        .init_plugin()
        // .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(not(target_os = "ios"))]
            use crate::setup_functions::state_setup::{setup_app_state, setup_job_queue_and_state};

            setup_app_state(app);

            // Initialize the job queue
            setup_job_queue_and_state(app);

            #[cfg(target_os = "macos")]
            setup_functions::state_setup::setup_macos_scanner_app_state(app);

            // Ici je corrige le problème de stabilité du file système le prblm prevenait du faire que j'ai utilisé des variables que les utilisateurs peuvent modifier pour nommer le file system de Kiné Helper. En conséquence lorsque les utilisateurs modifient une de ces variables, le file system se désynchronise d'avec KH qui recrée une nouvelle structure perdant ansi l'accès à toutes les données précédentes. example: si le nom du patient était modifié l'utilisateur perdait l'accès au dossier du patient qui portait son nom.
            perform_fs_stability_patch(app);

            println!("Performed file system stability patch");
            Ok(())
        })
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![
            get_app_state,
            set_app_state,
            set_e_health,
            set_organizations,
            generate_encryption_key,
            does_private_key_exist,
            encrypt_string,
            decrypt_string,
            from_base64_to_bytes,
            from_bytes_to_base64,
            setup_stronghold_key,
            get_b64_certificate,
            sha256_hash_bytes,
            sha256_hash_base64,
            get_eid_data,
            sign_eid_data,
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
            enqueue_job,
            compress_img_at_path,
            deflate_and_encode
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

                //* Safely shutdown the queue and wait for it to finish processing
                let _wait_for_queue =
                    setup_functions::on_exit::wait_for_queue_to_finish_then_shutdown(app);

                #[cfg(not(target_os = "ios"))]
                setup_functions::on_exit::clear_sqlite_cache(app);
            }
        });
}

#[cfg(mobile)]
fn setup_mobile() {
    tauri::Builder::default()
        .init_plugin()
        .setup(|app| {
            use crate::setup_functions::state_setup::{setup_app_state, setup_job_queue_and_state};

            setup_app_state(app);

            setup_job_queue_and_state(app);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            convention_decompression,
            get_app_state,
            set_app_state,
            generate_encryption_key,
            does_private_key_exist,
            encrypt_string,
            decrypt_string,
            from_base64_to_bytes,
            from_bytes_to_base64,
            setup_stronghold_key,
            setup_path,
            enqueue_job,
            set_organizations
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    println!("launching");
    #[cfg(desktop)]
    setup_desktop();
    #[cfg(mobile)]
    setup_mobile();
}
