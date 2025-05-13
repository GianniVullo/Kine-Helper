use aes_gcm::aead::{generic_array::GenericArray, Aead, KeyInit, OsRng};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use rand_core::RngCore;
use std::fs::File;
use std::io::{ErrorKind::NotFound, Read};
use std::sync::Mutex;
use tauri::Manager;

use crate::appstate::AppState;

#[tauri::command]
pub fn setup_stronghold_key(
    app_state: tauri::State<'_, Mutex<AppState>>,
    stronghold_key: String,
) -> Result<(), String> {
    let mut appstate = match app_state.lock() {
        Ok(state) => state,
        Err(err) => {
            return Err(format!(
                "Panic: cannot reatrive the appState from Mutex {}",
                err
            ))
        }
    };
    appstate.stronghold_key = Some(stronghold_key);
    Ok(())
}

fn get_main_key(
    app_handle: tauri::AppHandle,
    stronghold_key: String,
    user_id: &str,
) -> Result<String, String> {
    let app_local_data_dir = match app_handle.path().app_local_data_dir() {
        Ok(path) => path,
        Err(err) => return Err(format!("could not resolve app local data path : {}", err)),
    };
    let hold_path = app_local_data_dir.join(format!("{}.hold", user_id));

    match File::open(&hold_path) {
        Ok(mut file) => {
            let mut key_buffer = String::new();
            file.read_to_string(&mut key_buffer)
                .expect("Expected to open user vault");
            let decrypted = decrypt_fn(key_buffer, stronghold_key).unwrap();
            Ok(decrypted)
        }
        Err(err) => match err.kind() {
            NotFound => {
                return Err("Error: Cannot find a Stronghold in AppLocalDataDir".to_string())
            }
            _ => {
                return Err(format!(
                    "Error: while trying to find Stronghold in AppLocalDataDir {}",
                    err
                ))
            }
        },
    }
}

#[tauri::command]
pub fn does_private_key_exist(
    app_handle: tauri::AppHandle,
    app_state: tauri::State<'_, Mutex<AppState>>,
    user_id: String,
) -> Result<bool, String> {
    let stronghold_key = match get_stronghold_key(app_state) {
        Ok(key) => key,
        Err(_) => return Ok(false),
    };

    match get_main_key(app_handle, stronghold_key, &user_id) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
pub fn encrypt_string(
    app_handle: tauri::AppHandle,
    app_state: tauri::State<'_, Mutex<AppState>>,
    input: String,
    user_id: String,
) -> Result<String, String> {
    let stronghold_key = get_stronghold_key(app_state)?;
    let key = get_main_key(app_handle, stronghold_key, &user_id)?;
    encrypt_fn(input, key.clone())
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
pub fn decrypt_string(
    app_handle: tauri::AppHandle,
    app_state: tauri::State<'_, Mutex<AppState>>,
    encrypted: String,
    user_id: String,
) -> Result<String, String> {
    let stronghold_key = get_stronghold_key(app_state)?;
    let key = get_main_key(app_handle, stronghold_key, &user_id)?;

    decrypt_fn(encrypted, key.clone())
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
pub fn generate_encryption_key() -> String {
    STANDARD.encode(gen_fn())
}

fn gen_fn() -> [u8; 32] {
    let mut key = [0u8; 32]; // 32 bytes for AES-256
    OsRng.fill_bytes(&mut key);
    key
}

#[tauri::command]
pub fn from_base64_to_bytes(key: String) -> Vec<u8> {
    STANDARD.decode(key).unwrap()
}

#[tauri::command]
pub fn from_bytes_to_base64(bytes: Vec<u8>) -> String {
    STANDARD.encode(bytes)
}

fn get_stronghold_key(app_state: tauri::State<'_, Mutex<AppState>>) -> Result<String, String> {
    let state = app_state.lock().unwrap();
    match &state.stronghold_key {
        Some(key) => Ok(key.clone()),
        None => return Err("Cannot find encryption key when encrypting data".to_string()),
    }
}
