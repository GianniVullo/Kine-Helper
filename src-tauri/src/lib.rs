mod nomenclature;
mod printer;
use nomenclature::convention_decompression;
#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::raw_printer::unix::print_attestation;
#[cfg(target_os = "windows")]
use printer::raw_printer::windows::print_attestation;
use printers::{get_printers, printer::Printer};
use std::{
    fs::{self, File},
    io::{self, Read, Write},
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
fn setup_path(dir_path: String, file_name: String, file_content: Vec<u8>) {
    print!("{} {}", dir_path, file_name);
    let _ = fs::create_dir_all(&dir_path);
    let file_path = format!("{}/{}", dir_path, file_name);
    let mut file = File::create(file_path).unwrap();
    file.write_all(&file_content).unwrap();
}

#[tauri::command]
async fn get_printer() -> Vec<LocalPrinter> {
    let printers = get_printers();
    println!("{:?}", &printers);
    let local_printers = printers.into_iter().map(|p| p.into()).collect();
    local_printers
}

#[tauri::command]
async fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
async fn retrieve_file(path: String) -> Vec<u8> {
    // Open the file in read-only mode.
    let mut file = File::open(path).unwrap();

    // Create a vector to hold the bytes of the file.
    let mut buffer = Vec::new();

    // Read the file's bytes into the buffer.
    let _ = file.read_to_end(&mut buffer);

    buffer
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())
    } else {
        Err("File does not exist.".into())
    }
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
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![
            convention_decompression,
            print_attestation,
            setup_path,
            file_exists,
            delete_file,
            retrieve_file,
            get_printer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
