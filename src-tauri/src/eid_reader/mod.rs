pub mod eid_reader_resources;
pub mod get_card;
pub mod read_data;
use eid_reader_resources::FileType;
use get_card::get_card;
use read_data::read_file;
use std::collections::HashMap;

#[tauri::command]
pub async fn get_eid_data() -> Result<HashMap<String, String>, String> {
    let mut data = HashMap::new();
    let card = get_card()?;
    let file_data = read_file(&card, FileType::identity())?;
    let (niss, nom, prenom, date_naissance, sexe) = parse_id_data(Some(file_data));
    data.insert("niss".to_string(), niss.unwrap_or_default());
    data.insert("nom".to_string(), nom.unwrap_or_default());
    data.insert("prenom".to_string(), prenom.unwrap_or_default());
    data.insert(
        "date_naissance".to_string(),
        date_naissance.unwrap_or_default(),
    );
    data.insert("sexe".to_string(), sexe.unwrap_or_default());

    let file_data = read_file(&card, FileType::adresse())?;
    let (rue_et_numero, postal_code, city) = parse_address_data(Some(file_data));
    data.insert("adresse".to_string(), rue_et_numero.unwrap_or_default());
    data.insert("cp".to_string(), postal_code.unwrap_or_default());
    data.insert("localite".to_string(), city.unwrap_or_default());

    Ok(data)
}
/**
 * TLV = Tag Length Value
 ** C'est un format que les smartcard utilise pour structurer leurs réponses
 ** par exemple pour identité elle va répondre [T] [Length] [value]
 ** où T est l'id de la valeur par exemple 1,
 ** Length est la taille de la valeur par exemple 6 (pour 'Gianni'),
** et value est la valeur elle même par exemple 'Gianni'
 */
fn parse_tlv(data: &[u8]) -> HashMap<u8, Vec<u8>> {
    let mut map = HashMap::new();
    let mut i = 0;

    while i + 1 < data.len() {
        let tag = data[i];
        let length = data[i + 1] as usize;
        i += 2;

        if i + length > data.len() {
            // Avoid overflow if length is wrong
            break;
        }

        let value = data[i..i + length].to_vec();
        map.insert(tag, value);
        i += length;
    }

    map
}

fn parse_id_data(
    id_data: Option<Vec<u8>>,
) -> (
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
) {
    if let Some(data) = id_data {
        let tlv = parse_tlv(&data);

        let niss = tlv.get(&6).and_then(|v| String::from_utf8(v.clone()).ok());
        let niss_copy = niss.clone().unwrap_or_default();
        let nom = tlv.get(&7).and_then(|v| String::from_utf8(v.clone()).ok());
        let prenom = tlv.get(&8).and_then(|v| String::from_utf8(v.clone()).ok());
        let date_naissance = deduce_date_of_birth_from_niss(&niss_copy);
        let genre = deduce_gender_from_niss(&niss_copy);

        (niss, nom, prenom, date_naissance, genre)
    } else {
        (None, None, None, None, None)
    }
}

fn deduce_date_of_birth_from_niss(niss: &str) -> Option<String> {
    if niss.len() != 11 || !niss.chars().all(|c| c.is_digit(10)) {
        return None;
    }

    let birth_part = &niss[..6];
    let seq_part = &niss[6..9];
    let checksum_part = &niss[9..];

    let base_number: u64 = format!("{}{}", birth_part, seq_part).parse().ok()?;
    let checksum: u32 = checksum_part.parse().ok()?;

    // Try assuming birth in 1900s
    let valid_checksum_1900 = 97 - (base_number % 97) as u32;

    // Try assuming birth in 2000s
    let base_number_2000 = 2_000_000_000 + base_number;
    let valid_checksum_2000 = 97 - (base_number_2000 % 97) as u32;

    let (century_prefix, valid) = if checksum == valid_checksum_1900 {
        ("19", true)
    } else if checksum == valid_checksum_2000 {
        ("20", true)
    } else {
        ("", false)
    };

    if valid {
        let year = format!("{}{}", century_prefix, &birth_part[0..2]);
        let month = &birth_part[2..4];
        let day = &birth_part[4..6];
        Some(format!("{}-{}-{}", year, month, day))
    } else {
        None
    }
}

fn deduce_gender_from_niss(niss: &str) -> Option<String> {
    if niss.len() != 11 || !niss.chars().all(|c| c.is_ascii_digit()) {
        return None;
    }

    let gender_code = &niss[6..9]; // Extract the 3-digit sequence (NNN)
    if let Ok(code) = gender_code.parse::<u32>() {
        if code % 2 == 0 {
            Some("F".to_string())
        } else {
            Some("M".to_string())
        }
    } else {
        None
    }
}

fn parse_address_data(
    adresse_data: Option<Vec<u8>>,
) -> (Option<String>, Option<String>, Option<String>) {
    if let Some(data) = adresse_data {
        let tlv = parse_tlv(&data);

        let street = tlv.get(&1).and_then(|v| String::from_utf8(v.clone()).ok());
        let postal = tlv.get(&2).and_then(|v| String::from_utf8(v.clone()).ok());
        let city = tlv.get(&3).and_then(|v| String::from_utf8(v.clone()).ok());

        (street, postal, city)
    } else {
        (None, None, None)
    }
}
