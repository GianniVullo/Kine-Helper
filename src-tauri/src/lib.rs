mod nomenclature;
mod printer;
use nomenclature::convention_decompression;
#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::raw_printer::unix::print_attestation;
#[cfg(target_os = "windows")]
use printer::raw_printer::windows::print_attestation;

#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
use printers::{get_printers, printer::Printer};

use std::{
    fs::{self, File},
    io::{Read, Write},
    path::Path,
};
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
fn setup_path(dir_path: String, file_path: String, file_content: Vec<u8>) -> Result<String, String> {
    println!("Setting up path: directory -> {}, file -> {}", dir_path, file_path);
    
    // Create the directory and handle potential errors
    if let Err(e) = fs::create_dir_all(&dir_path) {
        return Err(format!("Failed to create directory: {}. Error: {}", dir_path, e));
    }
    
    // Create the file and handle potential errors
    let mut file = match File::create(&file_path) {
        Ok(f) => f,
        Err(e) => return Err(format!("Failed to create file: {}. Error: {}", file_path, e)),
    };
    
    // Write to the file and handle potential errors
    if let Err(e) = file.write_all(&file_content) {
        return Err(format!("Failed to write to file: {}. Error: {}", file_path, e));
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
        .setup(|app| {
            #[cfg(desktop)]
            app.handle()
                .plugin(tauri_plugin_updater::Builder::new().build())?;
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
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![
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
