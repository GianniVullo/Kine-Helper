use std::collections::HashMap;
use zune_inflate::DeflateDecoder;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Code {
    code_id: String,
    duree: Option<u8>,
    lieu: Option<u8>,
    honoraire: f32,
    remboursement: Option<HashMap<String, f32>>,
    groupe: Option<u8>,
    r#type: Option<u8>,
    drainage: bool,
    valeur: String,
    coefficient: f64,
    code_reference: String,
    convention_id: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Convention {
    titre: String,
    created_at: String,
    year: u16,
    month: u8,
    day: u8,
    documents: String,
    codes: Vec<Code>,
    convention_id: String,
}

#[tauri::command]
pub fn convention_decompression(value: Vec<u8>) -> Convention {
    let mut decoder = DeflateDecoder::new(&value);
    // panic on errors, because that's the cool way to go
    let decompressed_data = decoder.decode_gzip().unwrap();
    let json_d: Convention =
        serde_json::from_slice(&decompressed_data).expect("Something went wrong serializing json");
    json_d
}
