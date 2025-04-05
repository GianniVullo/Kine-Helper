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
    let (niss, nom, prenom) = parse_id_data(Some(file_data));
    data.insert("niss".to_string(), niss.unwrap_or_default());
    data.insert("nom".to_string(), nom.unwrap_or_default());
    data.insert("prenom".to_string(), prenom.unwrap_or_default());

    let file_data = read_file(&card, FileType::adresse())?;
    let (rue_et_numero, postal_code, city) = parse_adress_data(Some(file_data));
    data.insert(
        "adresse".to_string(),
        rue_et_numero.unwrap_or_default(),
    );
    data.insert("cp".to_string(), postal_code.unwrap_or_default());
    data.insert("localite".to_string(), city.unwrap_or_default());

    Ok(data)
}

fn parse_adress_data(
    adresse_data: Option<Vec<u8>>,
) -> (Option<String>, Option<String>, Option<String>) {
    if let Some(response) = adresse_data {
        let trimmed_message = &response
            .iter()
            .filter(|&x| *x != 0x00)
            .cloned()
            .collect::<Vec<u8>>();
        let rue_et_numero_end = trimmed_message
            .iter()
            .position(|x| *x == 0x02)
            .expect("cannot find end of the street and number");
        let rue_et_numero = &response[2..rue_et_numero_end];
        let postal_code_end = trimmed_message
            .iter()
            .position(|x| *x == 0x03)
            .expect("couldn't find the postal code end");
        let postal_code = &response[rue_et_numero_end + 2..postal_code_end];
        let city = &trimmed_message[postal_code_end + 2..];
        let parsed_rue_et_numero =
            String::from_utf8(rue_et_numero.to_vec()).expect("could not parse rue et numéro");
        let parsed_postal_code =
            String::from_utf8(postal_code.to_vec()).expect("could not parse postal code");
        let parsed_city = String::from_utf8(city.to_vec()).expect("could not parse city");
        (
            Some(parsed_rue_et_numero),
            Some(parsed_postal_code),
            Some(parsed_city),
        )
    } else {
        (None, None, None)
    }
}

fn parse_id_data(id_data: Option<Vec<u8>>) -> (Option<String>, Option<String>, Option<String>) {
    if let Some(response) = id_data {
        let niss_start = response
            .iter()
            .position(|&x| x == 6)
            .expect("niss start not found")
            + 2;
        let niss_end = response
            .iter()
            .position(|&x| x == 7)
            .expect("niss end not found");
        let niss = match String::from_utf8(response[niss_start..niss_end].to_vec()) {
            Ok(parsed_data) => Some(parsed_data),
            Err(err) => None,
        };

        let nom_start = niss_end + 2;
        let nom_end = response
            .iter()
            .position(|&x| x == 8)
            .expect("Field 2 end not found");
        let nom = match String::from_utf8(response[nom_start..nom_end].to_vec()) {
            Ok(parsed_data) => Some(parsed_data),
            Err(err) => None,
        };

        let prenom_start = nom_end + 2;
        let prenom_end = response
            .iter()
            .position(|&x| x == 9)
            .expect("Field 3 end not found");
        let prenom = match String::from_utf8(response[prenom_start..prenom_end].to_vec()) {
            Ok(parsed_data) => Some(parsed_data),
            Err(err) => None,
        };

        (niss, nom, prenom)
    } else {
        (None, None, None)
    }
}
