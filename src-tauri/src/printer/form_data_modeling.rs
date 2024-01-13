#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct EscpDocument {
    pub content: Vec<u8>,
}

impl EscpDocument {
    pub fn new() -> Self {
        let mut doc = EscpDocument {
            content: Vec::new(),
        };
        doc.initialize(); // Initialize with default ESC/P settings
        doc
    }

    pub fn initialize(&mut self) {
        // Add initial ESC/P commands (like resetting the printer)
        self.content.extend_from_slice(b"\x1B\x40"); // ESC @ to reset
    }

    pub fn add_text(&mut self, text: &str) {
        // Convert and add text to the content
        self.content.extend_from_slice(text.as_bytes());
    }

    pub fn set_font(&mut self, font: EscpFont) {
        // Add ESC/P command for font selection
        // Example: self.content.push(0x1B); // ESC command
        // Specific bytes for font selection go here
    }

    // More methods like set_alignment, add_image, etc.

    pub fn finalize(self) -> Vec<u8> {
        // Return the final ESC/P byte sequence
        self.content
    }

    // Example font enum for simplicity
    pub fn set_page_length_12_inch(&mut self) {
        // ESC C n (Set page length in lines)
        // Assuming 6 lines per inch, 12 inches would be 72 lines
        self.content.extend_from_slice(b"\x1B\x43\x48"); // ESC C 72
    }

    pub fn set_12_cpi(&mut self) {
        // ESC P (Select 12 CPI)
        self.content.push(0x1B);
        self.content.push(b'P');
    }

    pub fn set_10_cpi(&mut self) {
        // ESC M (Select 10 CPI)
        self.content.push(0x1B);
        self.content.push(b'M');
    }

    pub fn vertical_move(&mut self, lines: u8) {
        // ESC J n (Print and feed n/216 inch)
        // Example for 1 line assuming 6 lines per inch
        self.content.extend_from_slice(&[0x1B, b'J', lines]);
    }
    pub fn vertical_spacing(&mut self, mm: f32) {
        // Convert mm to a suitable value for vertical movement
        // This is a placeholder calculation
        let value = (mm / 25.4 * 6.0) as u8; // Assuming 6 lines per inch
        self.vertical_move(value);
    }

    // fn horizontal_move(&mut self, columns: u8) {
    //     // ESC $ nL nH (Set absolute horizontal print position)
    //     // Example: Move 10 columns assuming 10 CPI
    //     let low_byte = (columns % 256) as u8;
    //     let high_byte = (columns / 256) as u8;
    //     self.content.extend_from_slice(&[0x1B, b'$', low_byte, high_byte]);
    // }

    pub fn form_feed(&mut self) {
        // FF (Form Feed)
        self.content.push(0x0C);
    }

    // ... other methods ...
}

pub enum EscpFont {
    FontA,
    FontB,
    // Add more as needed
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Patient {
    pub nom: String,
    pub prenom: String,
    pub mutualite: String,
    pub niss: String,
    pub adresse: String,
    pub cp: String,
    pub localite: String,
}

impl Patient {
    pub fn full_name(&self) -> String {
        format!("{} {}", self.prenom, self.nom)
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Prescription {
    pub prescripteur: Prescripteur,
    pub date: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Prescripteur {
    pub nom: String,
    pub prenom: String,
    pub inami: String,
}

impl Prescripteur {
    pub fn full_name(&self) -> String {
        format!("{} {}", self.prenom, self.nom)
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Attestation {
    pub porte_prescr: bool,
    pub total_recu: String,
    pub date: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Kine {
    pub nom: String,
    pub prenom: String,
    pub inami: String,
    pub adresse: String,
    pub cp: String,
    pub localite: String,
    pub numero_bce: String,
}

impl Kine {
    pub fn full_name(&self) -> String {
        format!("{} {}", self.prenom, self.nom)
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct SituationPathologique {
    pub numero_etablissment: String,
    pub service: String,
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct DocumentFormData {
    pub patient: Patient,
    pub prescription: Prescription,
    pub attestation: Attestation,
    pub kine: Kine,
    pub situation_pathologique: SituationPathologique,
}
