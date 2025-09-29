pub mod image_compression;
pub mod jobs;
// pub mod postgrest;
pub mod queue;
pub mod state;
use base64::{engine::general_purpose, Engine as _};
use flate2::write::DeflateEncoder;
use flate2::Compression;
use std::io::Write;

#[tauri::command]
pub fn deflate_and_encode(content: String) -> Result<String, String> {
    let mut encoder = DeflateEncoder::new(Vec::new(), Compression::default());
    encoder
        .write_all(content.as_bytes())
        .map_err(|e| e.to_string())?;
    let compressed = encoder.finish().map_err(|e| e.to_string())?;

    Ok(general_purpose::STANDARD.encode(compressed))
}
