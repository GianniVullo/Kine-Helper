#[derive(Debug, Clone, Copy)]
pub enum CommandAPDU {
    SelectApplet(u8, u8, u8, u8),
    SelectFile(u8, u8, u8, u8),
    ReadBinary(u8, u8, u8, u8),
    VerifyPin(u8, u8, u8, u8),
    ChangePin(u8, u8, u8, u8),
    SelectAlgorithmAndPrivateKey(u8, u8, u8, u8),
    ComputeDigitalSignature(u8, u8, u8, u8),
    ResetPin(u8, u8, u8, u8),
    GetChallenge(u8, u8, u8, u8),
    GetCardData(u8, u8, u8, u8),
    GetCardData1_8(u8, u8, u8, u8),
    Ppdu(u8, u8, u8),
    InternalAuthenticate(u8, u8, u8, u8),
}

impl CommandAPDU {
    // Default constructors with preset values
    pub fn select_applet() -> Self {
        CommandAPDU::SelectApplet(0, 164, 4, 12)
    }

    pub fn select_file() -> Self {
        CommandAPDU::SelectFile(0x00, 0xA4, 0x08, 0x0C)
    }

    pub fn read_binary() -> Self {
        CommandAPDU::ReadBinary(0x00, 0xB0, 0x00, 0x00) // Assuming default P1, P2 values
    }

    pub fn verify_pin() -> Self {
        CommandAPDU::VerifyPin(0x00, 0x20, 0x00, 0x01)
    }
    pub fn change_pin() -> Self {
        CommandAPDU::ChangePin(0, 36, 0, 1)
    }

    pub fn select_algorithm_and_private_key() -> Self {
        CommandAPDU::SelectAlgorithmAndPrivateKey(0x00, 0x22, 0x41, 0xB6)
    }

    pub fn compute_digital_signature() -> Self {
        CommandAPDU::ComputeDigitalSignature(0x00, 0x2A, 0x9E, 0x9A)
    }

    pub fn reset_pin() -> Self {
        CommandAPDU::ResetPin(0, 44, 0, 1)
    }

    pub fn get_challenge() -> Self {
        CommandAPDU::GetChallenge(0, 132, 0, 0)
    }

    pub fn get_card_data() -> Self {
        CommandAPDU::GetCardData(128, 228, 0, 0)
    }

    pub fn get_card_data_1_8() -> Self {
        CommandAPDU::GetCardData1_8(128, 228, 0, 1)
    }

    pub fn ppdu() -> Self {
        CommandAPDU::Ppdu(255, 194, 1)
    }

    pub fn internal_authenticate() -> Self {
        CommandAPDU::InternalAuthenticate(0, 136, 2, 129)
    }

    pub fn get_cmd(&self) -> Vec<u8> {
        match self {
            CommandAPDU::SelectApplet(cla, ins, p1, p2)
            | CommandAPDU::SelectFile(cla, ins, p1, p2)
            | CommandAPDU::VerifyPin(cla, ins, p1, p2)
            | CommandAPDU::ChangePin(cla, ins, p1, p2)
            | CommandAPDU::SelectAlgorithmAndPrivateKey(cla, ins, p1, p2)
            | CommandAPDU::ComputeDigitalSignature(cla, ins, p1, p2)
            | CommandAPDU::ResetPin(cla, ins, p1, p2)
            | CommandAPDU::GetChallenge(cla, ins, p1, p2)
            | CommandAPDU::GetCardData(cla, ins, p1, p2)
            | CommandAPDU::GetCardData1_8(cla, ins, p1, p2)
            | CommandAPDU::InternalAuthenticate(cla, ins, p1, p2) => vec![*cla, *ins, *p1, *p2],
            CommandAPDU::ReadBinary(cla, ins, _p1, _p2) => vec![*cla, *ins],
            CommandAPDU::Ppdu(cla, ins, p1) => vec![*cla, *ins, *p1],
        }
    }

    pub fn select_pin(pin: &str) -> Result<[u8; 13], String> {
        if pin.len() != 4 {
            return Err("PIN must be exactly 4 digits".to_string());
        }
        let pin_bcd = pin_data_structure(&pin)?;

        Ok([
            0x00, 0x20, 0x00, 0x01, 0x08, pin_bcd[0], pin_bcd[1], pin_bcd[2], pin_bcd[3],
            pin_bcd[4], pin_bcd[5], pin_bcd[6], pin_bcd[7],
        ])
    }

    pub fn select_sts_signature_algo() -> [u8; 10] {
        [0x00, 0x22, 0x41, 0xB6, 0x05, 0x04, 0x80, 0x01, 0x84, 0x82]
    }

    pub fn compute_digital_signature_cmd(hash: &[u8]) -> Result<[u8; 56], String> {
        const ASN_CONSTANT: [u8; 19] = [
            0x30, 0x31, 0x30, 0x0D, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02,
            0x01, 0x05, 0x00, 0x04, 0x20,
        ];

        if hash.len() != 32 {
            return Err(format!(
                "Expected SHA-256 hash (32 bytes), got {} bytes",
                hash.len()
            ));
        }

        let mut apdu = [0u8; 56];
        apdu[..4].copy_from_slice(&[0x00, 0x2A, 0x9E, 0x9A]); // Command Header
        apdu[4] = 51; // Lc (Length of Data)
        apdu[5..24].copy_from_slice(&ASN_CONSTANT); // ASN.1 DER Encoding
        apdu[24..].copy_from_slice(hash); // SHA-256 Hash

        Ok(apdu)
    }
}

#[derive(Debug, Clone, Copy)]
pub enum FileType {
    Identity {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    IdentitySignature {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    Address {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    AddressSignature {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    Photo {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    AuthenticationCertificate {
        file_id: [u8; 6],
        estimated_max_size: u16,
        key_id: u8,
    },
    NonRepudiationCertificate {
        file_id: [u8; 6],
        estimated_max_size: u16,
        key_id: u8,
    },
    CACertificate {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    RootCertificate {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    RRNCertificate {
        file_id: [u8; 6],
        estimated_max_size: u16,
    },
    BasicPublic {
        file_id: [u8; 6],
        estimated_max_size: u16,
        key_id: u8,
    },
}

impl FileType {
    pub fn identity() -> FileType {
        FileType::Identity {
            file_id: [0x3F, 0x00, 0xDF, 0x01, 0x40, 0x31],
            estimated_max_size: 179,
        }
    }

    pub fn identity_signature() -> FileType {
        FileType::IdentitySignature {
            file_id: [0x3F, 0x00, 0xDF, 0x01, 0x40, 0x32],
            estimated_max_size: 256,
        }
    }

    pub fn adresse() -> FileType {
        FileType::Address {
            file_id: [0x3F, 0x00, 0xDF, 0x01, 0x40, 0x33],
            estimated_max_size: 121,
        }
    }

    pub fn adresse_signature() -> FileType {
        FileType::Address {
            file_id: [0x3F, 0x00, 0xDF, 0x01, 0x40, 0x34],
            estimated_max_size: 256,
        }
    }

    pub fn photo() -> FileType {
        FileType::Photo {
            file_id: [0x3F, 0x00, 0xDF, 0x01, 0x40, 0x35],
            estimated_max_size: 3064,
        }
    }

    pub fn authentication_certificate() -> FileType {
        FileType::AuthenticationCertificate {
            file_id: [0x3F, 0x00, 0xDF, 0x00, 0x50, 0x38],
            estimated_max_size: 1900,
            key_id: 130,
        }
    }

    pub fn non_repudiation_certificate() -> FileType {
        FileType::NonRepudiationCertificate {
            file_id: [0x3F, 0x00, 0xDF, 0, 80, 57],
            estimated_max_size: 1900,
            key_id: 131,
        }
    }

    pub fn ca_certificate() -> FileType {
        FileType::CACertificate {
            file_id: [0x3F, 0x00, 0xDF, 0, 80, 58],
            estimated_max_size: 1556,
        }
    }

    pub fn root_certificate() -> FileType {
        FileType::RootCertificate {
            file_id: [0x3F, 0x00, 0xDF, 0, 80, 59],
            estimated_max_size: 1426,
        }
    }

    pub fn rrn_certificate() -> FileType {
        FileType::RRNCertificate {
            file_id: [0x3F, 0x00, 0xDF, 0, 80, 60],
            estimated_max_size: 1207,
        }
    }

    pub fn basic_public() -> FileType {
        FileType::BasicPublic {
            file_id: [0x3F, 0x00, 0xDF, 0x01, 0x40, 0x40],
            estimated_max_size: 120,
            key_id: 129,
        }
    }

    pub fn get_full_command(&self) -> Vec<u8> {
        match self {
            FileType::Identity { file_id, .. }
            | FileType::IdentitySignature { file_id, .. }
            | FileType::Address { file_id, .. }
            | FileType::AddressSignature { file_id, .. }
            | FileType::AuthenticationCertificate { file_id, .. }
            | FileType::Photo { file_id, .. } => {
                let apdu_header = CommandAPDU::select_file();
                let header: Vec<u8> = apdu_header
                    .get_cmd()
                    .into_iter()
                    .chain([6].to_vec().into_iter())
                    .collect();
                header
                    .into_iter()
                    .chain(file_id.to_vec().into_iter())
                    .collect()
            }
            FileType::NonRepudiationCertificate { file_id, .. } => vec![],
            FileType::CACertificate { file_id, .. } => vec![],
            FileType::RootCertificate { file_id, .. } => vec![],
            FileType::RRNCertificate { file_id, .. } => vec![],
            FileType::BasicPublic { file_id, .. } => file_id.to_vec(),
        }
    }

    pub fn get_file_id(&self) -> &[u8; 6] {
        match self {
            FileType::Identity { file_id, .. }
            | FileType::IdentitySignature { file_id, .. }
            | FileType::Address { file_id, .. }
            | FileType::AddressSignature { file_id, .. }
            | FileType::Photo { file_id, .. }
            | FileType::AuthenticationCertificate { file_id, .. }
            | FileType::NonRepudiationCertificate { file_id, .. }
            | FileType::CACertificate { file_id, .. }
            | FileType::RootCertificate { file_id, .. }
            | FileType::RRNCertificate { file_id, .. }
            | FileType::BasicPublic { file_id, .. } => file_id,
        }
    }

    pub fn get_expected_size(&self) -> usize {
        match self {
            FileType::Identity {
                estimated_max_size, ..
            }
            | FileType::IdentitySignature {
                estimated_max_size, ..
            }
            | FileType::Address {
                estimated_max_size, ..
            }
            | FileType::AddressSignature {
                estimated_max_size, ..
            }
            | FileType::Photo {
                estimated_max_size, ..
            }
            | FileType::AuthenticationCertificate {
                estimated_max_size, ..
            }
            | FileType::NonRepudiationCertificate {
                estimated_max_size, ..
            }
            | FileType::CACertificate {
                estimated_max_size, ..
            }
            | FileType::RootCertificate {
                estimated_max_size, ..
            }
            | FileType::RRNCertificate {
                estimated_max_size, ..
            }
            | FileType::BasicPublic {
                estimated_max_size, ..
            } => estimated_max_size.to_owned().into(),
        }
    }

    pub fn get_key_id(&self) -> Option<u8> {
        match self {
            FileType::AuthenticationCertificate { key_id, .. }
            | FileType::NonRepudiationCertificate { key_id, .. }
            | FileType::BasicPublic { key_id, .. } => Some(*key_id),
            _ => None,
        }
    }
}

pub struct ResponseAPDU {
    pub apdu: Vec<u8>,
}

impl ResponseAPDU {
    pub fn new(var1: &[u8]) -> ResponseAPDU {
        ResponseAPDU {
            apdu: var1.to_vec(),
        }
    }

    pub fn get_nr(&self) -> usize {
        return self.apdu.len() - 2;
    }

    pub fn get_data(&self) -> Vec<u8> {
        let var1 = self.apdu[0..self.apdu.len() - 2].to_vec();
        var1
    }

    pub fn get_sw1(&self) -> u8 {
        return self.apdu[self.apdu.len() - 2] & 255;
    }

    pub fn get_sw2(&self) -> u8 {
        return self.apdu[self.apdu.len() - 1] & 255;
    }

    pub fn get_sw(&self) -> u16 {
        (self.get_sw1() as u16) << 8 | (self.get_sw2() as u16)
    }
}

fn pin_data_structure(pin: &str) -> Result<[u8; 8], String> {
    let len = pin.len();
    if len != 4 && len != 6 {
        return Err("PIN must be exactly 4 or 6 digits".to_string());
    }

    if !pin.chars().all(|c| c.is_ascii_digit()) {
        return Err("PIN must contain only numeric digits".to_string());
    }

    let mut verify_data = [0xFF; 8]; // Default all bytes to 0xFF
    verify_data[0] = 0x20 | pin.len() as u8; // Set control byte

    // Convert PIN from ASCII digits to BCD format
    let pin_bytes: Vec<u8> = pin
        .chars()
        .map(|c| c as u8 - b'0') // Convert ASCII digit to integer (0-9)
        .collect();

    for i in (0..pin_bytes.len()).step_by(2) {
        let digit1 = pin_bytes[i];
        let digit2 = if i + 1 < pin_bytes.len() {
            pin_bytes[i + 1]
        } else {
            0xF
        }; // Default '?' (0xF) if odd-length
        verify_data[i / 2 + 1] = (digit1 << 4) | digit2; // Pack two digits into one BCD byte
    }

    Ok(verify_data)
}
