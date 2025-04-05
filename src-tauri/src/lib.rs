mod appstate;
mod cryptage;
mod eid_reader;
mod nomenclature;
mod printer;
mod stability_corrections;

use appstate::AppState;
use nomenclature::convention_decompression;

#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::raw_printer::unix::print_attestation;

#[cfg(target_os = "windows")]
use printer::raw_printer::windows::print_attestation;

#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
use printers::{common::base::printer::Printer, get_printers};

use appstate::{get_app_state, set_app_state};
use cryptage::{
    decrypt_string, does_private_key_exist, encrypt_string, from_base64_to_bytes,
    from_bytes_to_base64, generate_encryption_key, setup_stronghold_key,
};
use eid_reader::get_eid_data;
use stability_corrections::file_system_correction::perform_fs_stability_patch;
use std::sync::Mutex;
use std::{
    fs::{self, File},
    io::Write,
};
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

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
                .build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;
            app.manage(Mutex::new(AppState::default()));
            // Ici je corrige le problème de stabilité du file système le prblm prevenait du faire que j'ai utilisé des variables que les utilisateurs peuvent modifier pour nommer le file system de Kiné Helper. En conséquence lorsque les utilisateurs modifient une de ces variables, le file system se désynchronise d'avec KH qui recrée une nouvelle structure perdant ansi l'accès à toutes les données précédentes.
            perform_fs_stability_patch(app);
            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:kinehelper.db",
                    vec![
                        Migration {
                            version: 0,
                            description: "Conventions",
                            sql: include_str!("migrations/20231204175351_conventions.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 1,
                            description: "Ajout de champs mutuelle_paid et patient_paid dans la table attestation",
                            sql: include_str!("migrations/20240220173643_mutuelle_paid_attestation.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 2,
                            description: "Ajout du docType à la table document",
                            sql: include_str!("migrations/20240220193637_docType.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 3,
                            description: "Typo sur la table patients",
                            sql: include_str!("migrations/20240305190432_renamepatient.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 4,
                            description: "Typo sur la table attestations",
                            sql: include_str!("migrations/20240307202642_typo2.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 5,
                            description: "Ajout de la table kines",
                            sql: include_str!("migrations/20240309173246_kine.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 6,
                            description: "Ajout de la column 9 pin à la table settings",
                            sql: include_str!("migrations/20240318145714_9pin.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 7,
                            description: "Ajout des dernières histoires à la table SP",
                            sql: include_str!("migrations/20240321080003_sp_with_group.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 8,
                            description: "Rename column kinesitherapeute_id to user_id for standardization in table patients",
                            sql: include_str!("migrations/20240906062350_rename_patients_kine_id.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 9,
                            description: "New tarification paradigma",
                            sql: include_str!("migrations/20250119121051_tarifs_et_supplement.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 10,
                            description: "Added Appareils table that will only be local to track the USB/Bluetooth devices linked to the machine",
                            sql: include_str!("migrations/20250216165021_appareils.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 11,
                            description: "Added column metadata to tables tarifs and supplements",
                            sql: include_str!("migrations/20250216165602_tarifs_metadata.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 12,
                            description: "Added missing column amb_hos to tables sp",
                            sql: include_str!("migrations/20250225195209_sp_amb_hos.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 13,
                            description: "Added control column to table seances",
                            sql: include_str!("migrations/20250306133523_seance_completion.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 14,
                            description: "Documents et Séances API Refonte + migration of seance and document tables",
                            sql: include_str!("migrations/20250316133523_migrate_data_and_document_refonte.up.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 15,
                            description: "Adding a kv store in the db",
                            sql: include_str!("migrations/20250325133523_kv_store.up.sql"),
                            kind: MigrationKind::Up,
                        },
                    ],
                )
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
            get_eid_data,
            convention_decompression,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            print_attestation,
            setup_path,
            #[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
            get_printer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
