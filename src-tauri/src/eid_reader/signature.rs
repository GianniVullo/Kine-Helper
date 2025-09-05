use crate::eid_reader::eid_reader_resources::{CommandAPDU, ResponseAPDU};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use pcsc::MAX_BUFFER_SIZE;
use ring::{
    rand::SystemRandom,
    signature::{RsaKeyPair, RSA_PKCS1_SHA256},
};
// use rustls_pemfile::pkcs8_private_keys;
use std::fs::File;
use std::io::BufReader;

pub fn sign(card: &pcsc::Card, hash: Vec<u8>, pin: &str) -> Result<String, String> {
    //* steps :
    //*     - Select signing capabilities on card
    //*     - Verify Pin
    //*     - Sign using card
    //*     - format in b64

    print!("BEGINNING SIGNING");
    // 1️⃣ Select Authentication File
    let select_apdu = CommandAPDU::select_sts_signature_algo();
    let mut response = [0; MAX_BUFFER_SIZE];
    // Ici on ne fait rien avec la réponse parce qu'on sélectionne juste le certificat
    card.transmit(&select_apdu, &mut response)
        .map_err(|e| format!("Failed to select certificate: {:?}", e))?;
    print!("Certificate Selected");
    // 2️⃣ Verify PIN
    let verify_apdu = CommandAPDU::select_pin(pin)?;
    let pin_valid = match card.transmit(&verify_apdu, &mut response) {
        Ok(data) => ResponseAPDU::new(data),
        Err(_) => return Err("Le pin est incorrect".to_string()),
    };
    let sw1 = pin_valid.get_sw1();
    let sw2 = pin_valid.get_sw2();
    let sw = pin_valid.get_sw();

    match sw {
        0x9000 => {
            print!("0x9000")
        } // PIN Ok
        0x63C3 => return Err("PIN incorrect, 3 attempts remaining".to_string()),
        0x63C2 => return Err("PIN incorrect, 2 attempts remaining".to_string()),
        0x63C1 => return Err("PIN incorrect, 1 attempt remaining".to_string()),
        0x63C0 => return Err("PIN incorrect, PIN is now blocked".to_string()),
        0x6983 => return Err("PIN blocked, use PUK to unblock".to_string()),
        0x6A86 => return Err("Incorrect APDU parameters".to_string()),
        0x6A88 => return Err("PIN verification method not found".to_string()),
        0x6700 => return Err("Wrong APDU length".to_string()),
        0x6D00 => return Err("Invalid APDU instruction".to_string()),
        _ => {
            return Err(format!(
                "Unknown error while validating PIN: SW1={:02X}, SW2={:02X}",
                sw1, sw2
            ))
        }
    };
    print!("Pin is verified");
    // 3️⃣ Send Hash to Sign
    let sign_apdu = CommandAPDU::compute_digital_signature_cmd(&hash)?;
    print!("THE sign cmd : {:?}", sign_apdu);
    let mut signature_request = [0; MAX_BUFFER_SIZE];

    let response = match card.transmit(&sign_apdu, &mut signature_request) {
        Ok(data) => ResponseAPDU::new(data),
        Err(_) => return Err("Failed to lauch the SignedInfo Hash signature".to_string()),
    };

    let signature = handle_compute_signature_response(response, card)?;
    print!("THE SIGNATURE RESPONSE {:?}", signature);
    Ok(STANDARD.encode(signature))
}

fn handle_compute_signature_response(
    response: ResponseAPDU,
    card: &pcsc::Card,
) -> Result<Vec<u8>, String> {
    let sw1 = response.get_sw1();
    let sw2 = response.get_sw2();

    match (sw1, sw2) {
        (0x90, 0x00) => Ok(response.get_data()),
        (0x69, 0x82) => Err("Security condition not satisfied (wrong PIN)".to_string()),
        (0x61, xx) => {
            // Smartcard has more data to send, request it using GET RESPONSE
            let get_response_apdu = vec![0x00, 0xC0, 0x00, 0x00, xx]; // xx = number of bytes in SW2
            let mut response_buf = [0; pcsc::MAX_BUFFER_SIZE];

            match card.transmit(&get_response_apdu, &mut response_buf) {
                Ok(data) => {
                    let final_response = ResponseAPDU::new(data);
                    if final_response.get_sw() == 0x9000 {
                        Ok(final_response.get_data())
                    } else {
                        Err(format!(
                            "GET RESPONSE failed: SW1={:02X}, SW2={:02X}",
                            final_response.get_sw1(),
                            final_response.get_sw2()
                        ))
                    }
                }
                Err(_) => Err("Failed to send GET RESPONSE".to_string()),
            }
        }
        (0x69, 0x85) => Err("Conditions of use not satisfied".to_string()),
        (0x67, 0x00) => Err("Wrong length (hash size issue)".to_string()),
        (0x6A, 0x80) => Err("Incorrect parameters in the command".to_string()),
        (0x6A, 0x82) => Err("File not found (wrong key slot selected)".to_string()),
        (0x6D, 0x00) => Err("Instruction code (INS) not supported".to_string()),
        _ => Err(format!("Unknown error: SW1={:02X}, SW2={:02X}", sw1, sw2)),
    }
}

// pub fn sign_with_ehealth_private_key(pem_path: &str, hash: Vec<u8>) -> Result<String, String> {
//     // Read and parse the private key PEM file
//     let mut reader = BufReader::new(File::open(pem_path).map_err(|_| "Failed to read PEM file")?);
//     let private_keys: Vec<_> = pkcs8_private_keys(&mut reader)
//         .filter_map(|key| key.ok()) // Filter out errors
//         .collect();

//     // Ensure at least one key exists
//     let private_key = private_keys.first().ok_or("No valid private key found")?;

//     // Load the RSA private key
//     let key_pair = RsaKeyPair::from_pkcs8(private_key.secret_pkcs8_der())
//         .map_err(|_| "Failed to load RSA private key")?;

//     // Generate a secure random number generator
//     let rng = SystemRandom::new();

//     // Sign the hash using RSA-PKCS1 v1.5 with SHA-256
//     let mut signature = vec![0; key_pair.public().modulus_len()];
//     key_pair
//         .sign(&RSA_PKCS1_SHA256, &rng, hash.as_ref(), &mut signature)
//         .map_err(|_| "Failed to sign hash")?;

//     // Base64-encode the signature
//     Ok(STANDARD.encode(signature))
// }
