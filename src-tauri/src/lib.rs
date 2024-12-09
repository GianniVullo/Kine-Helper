mod nomenclature;
mod printer;
use aes_gcm::aead::{generic_array::GenericArray, Aead, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use nomenclature::convention_decompression;

#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::raw_printer::unix::print_attestation;

#[cfg(target_os = "windows")]
use printer::raw_printer::windows::print_attestation;

#[cfg(any(target_os = "macos", target_os = "linux", target_os = "windows"))]
use printers::{get_printers, printer::Printer};

use rand_core::RngCore;
use tauri::Manager;

use std::io::{ErrorKind::NotFound, Read};
use std::sync::Mutex;
use std::{
    fs::{self, File},
    io::Write,
};
use tauri_plugin_sql::{Migration, MigrationKind};

struct StrongholdKey(Mutex<String>);

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
fn setup_stronghold_key(
    app_state: tauri::State<'_, StrongholdKey>,
    stronghold_key: String,
) -> Result<(), String> {
    let mut key = app_state.0.lock().unwrap();
    *key = stronghold_key;
    Ok(())
}

#[tauri::command]
fn get_main_key(
    app_handle: tauri::AppHandle,
    app_state: tauri::State<'_, StrongholdKey>,
    user_id: String,
) -> Result<String, String> {
    println!("in get_main_key with {}", format!("userId {}", &user_id));
    let hold_path = app_handle
        .path()
        .app_local_data_dir()
        .expect("could not resolve app local data path")
        .join(format!("{}.hold", user_id));
    let stronghold_key = app_state.0.lock().unwrap();
    println!(
        "Stronghold key = {}",
        format!("{}", (*&stronghold_key).to_string())
    );

    match File::open(&hold_path) {
        Ok(mut file) => {
            let mut key_buffer = String::new();
            file.read_to_string(&mut key_buffer)
                .expect("Expected to open user vault");
            println!("the encoded key buffer = {}", format!("{}", &key_buffer));
            let decrypted = decrypt_fn(key_buffer, (*&stronghold_key).to_string()).unwrap();
            println!("the decrypted string = {}", format!("{}", &decrypted));
            Ok(decrypted)
        }
        Err(err) if err.kind() == NotFound => {
            let mut new_hold = File::create(&hold_path).expect("Could not create hold file");
            let key = STANDARD.encode(gen_fn());
            println!("the key = {}", format!("{}", &key));
            let encrypted_key = encrypt_fn(key.clone(), (*&stronghold_key).to_string())
                .expect("Could not encrypt key");
            println!("the encrypted key = {}", format!("{}", &encrypted_key));
            println!("{}", format!("{}", &encrypted_key));
            let _ = new_hold.write_all(&encrypted_key.as_bytes());
            let mut testing = String::new();
            let _ = new_hold.read_to_string(&mut testing);
            println!("Thre testing {}", format!("{}", &testing));
            Ok(key)
        }
        Err(_err) => {
            panic!()
        }
    }
}

#[tauri::command]
fn encrypt_string(input: String, key: String) -> Result<String, String> {
    encrypt_fn(input, key)
}

fn encrypt_fn(input: String, key: String) -> Result<String, String> {
    let key_bytes = STANDARD.decode(key).map_err(|e| e.to_string())?;
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    // Generate a random nonce
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Encrypt the input string
    let ciphertext = cipher
        .encrypt(nonce, input.as_bytes())
        .map_err(|e| e.to_string())?;

    // Return the encrypted data as a hex string along with the nonce
    Ok(format!(
        "{}:{}",
        STANDARD.encode(ciphertext),
        STANDARD.encode(nonce)
    ))
}

#[tauri::command]
fn decrypt_string(encrypted: String, key: String) -> Result<String, String> {
    decrypt_fn(encrypted, key)
}

fn decrypt_fn(encrypted: String, key: String) -> Result<String, String> {
    println!("in decrypt_fn with {}", format!("{} {}", &encrypted, &key));
    let key_bytes = STANDARD.decode(key).map_err(|e| e.to_string())?;
    let key = GenericArray::from_slice(&key_bytes);
    let cipher = Aes256Gcm::new(key);

    let parts: Vec<&str> = encrypted.split(':').collect();
    println!("in decrypt_fn with {}", format!("{:#?}", &parts));
    if parts.len() != 2 {
        return Err("Invalid encrypted string format".into());
    }

    let ciphertext = STANDARD.decode(parts[0]).map_err(|e| e.to_string())?;
    let nonce = STANDARD.decode(parts[1]).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(&nonce);

    // Decrypt the encrypted string
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8(plaintext).map_err(|e| e.to_string())?)
}
#[tauri::command]
fn generate_encryption_key() -> String {
    STANDARD.encode(gen_fn())
}

fn gen_fn() -> [u8; 32] {
    let mut key = [0u8; 32]; // 32 bytes for AES-256
    OsRng.fill_bytes(&mut key);
    key
}

#[tauri::command]
fn from_base64_to_bytes(key: String) -> Vec<u8> {
    STANDARD.decode(key).unwrap()
}

#[tauri::command]
fn from_bytes_to_base64(bytes: Vec<u8>) -> String {
    STANDARD.encode(bytes)
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
        .manage(StrongholdKey(Mutex::new("done".into())))
        .plugin(tauri_plugin_clipboard_manager::init())
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
                        Migration {
                            version: 8,
                            description: "Rename column kinesitherapeute_id to user_id for standardization in table patients",
                            sql: include_str!("migrations/20240906062350_rename_patients_kine_id.up.sql"),
                            kind: MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![
            generate_encryption_key,
            encrypt_string,
            decrypt_string,
            from_base64_to_bytes,
            from_bytes_to_base64,
            get_main_key,
            setup_stronghold_key,
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
