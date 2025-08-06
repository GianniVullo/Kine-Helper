use crate::printer::form_data_modeling::{Attestation, DocumentFormData, Seance};
use unidecode::unidecode;

struct ESCP {
    pub is_nine_pin: bool,
    pub format_to_12_inch: Vec<u8>,
    pub form_feed_cmd: Vec<u8>,
    pub set_to_12_cpi: Vec<u8>,
    pub set_to_10_cpi: Vec<u8>,
}

impl Default for ESCP {
    fn default() -> Self {
        ESCP {
            is_nine_pin: true,
            format_to_12_inch: vec![0x1b, 0x43, 0x00, 0x0c],
            form_feed_cmd: vec![0x0c],
            set_to_12_cpi: vec![0x1b, 0x4d],
            set_to_10_cpi: vec![0x1b, 0x50],
        }
    }
}

impl ESCP {
    pub fn vertical_spacing_distances(&self) -> ([u16; 5], [u16; 11], [u16; 9], [u16; 2]) {
        (
            self.identification_section_9_pins(),
            self.lignes_prestation_section_9_pins(),
            self.section_prescription_hospitalisation_9_pin(),
            self.section_signature_9_pin(),
        )
    }

    pub fn identification_section_9_pins(&self) -> [u16; 5] {
        [108, 46, 62, 46, 141]
    }

    pub fn lignes_prestation_section_9_pins(&self) -> [u16; 11] {
        // Le premier c'est entre le nom et le tableau et ensuite ce sont les différente lignes du tableau
        [396, 36, 35, 36, 35, 36, 37, 35, 36, 35, 39]
    }

    pub fn section_prescription_hospitalisation_9_pin(&self) -> [u16; 9] {
        [33, 37, 37, 33, 100, 29, 21, 29, 31]
    }

    pub fn section_signature_9_pin(&self) -> [u16; 2] {
        [112, 83]
    }

    pub fn vertical_spacing(&self, mm: f64) -> Vec<u8> {
        let mut cmd: Vec<u8> = vec![0x1b, 0x4a];
        let arg: u8 = (mm * if self.is_nine_pin { 8.3 } else { 7.1 }).round() as u8;
        cmd.push(arg);
        cmd
    }

    pub fn vertical_spacing_in_dots(&self, dots: u16) -> Vec<u8> {
        let mut cmd: Vec<u8> = Vec::new();
        let mut remaining_dots = dots;
        // Comme la commande ESC J ne supporte que des u8
        while remaining_dots > 255 {
            cmd.push(0x1b); // ESC
            cmd.push(0x4a); // J
            cmd.push(255);
            remaining_dots -= 255;
        }

        if remaining_dots > 0 {
            cmd.push(0x1b); // ESC
            cmd.push(0x4a); // J
            cmd.push(remaining_dots as u8);
        }

        cmd
    }
}

pub fn build_binary(vectors: Vec<Vec<u8>>) -> Vec<u8> {
    let mut binary: Vec<u8> = vec![];
    for vector in vectors {
        binary.append(&mut vector.clone());
    }
    binary
}

pub fn build_document(form_data: DocumentFormData) -> Vec<u8> {
    let DocumentFormData {
        patient,
        prescription,
        attestation,
        kine,
        situation_pathologique,
        is_nine_pin,
    } = form_data;

    let escp_cmds = ESCP {
        is_nine_pin: is_nine_pin,
        format_to_12_inch: vec![0x1b, 0x43, 0x00, 0x0c],
        form_feed_cmd: vec![0x0c],
        set_to_12_cpi: vec![0x1b, 0x4d],
        set_to_10_cpi: vec![0x1b, 0x50]
    };

    let (id_section, prestations_section, prescription_section, section_signature_dist) =
        escp_cmds.vertical_spacing_distances();

    let section_identification_patient = vec![
        escp_cmds.format_to_12_inch.clone(),
        escp_cmds.vertical_spacing(7.05),
        format!("\t\t     {}", unidecode(&patient.full_name())).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(id_section[0]),
        format!("\r\t\t   {}", patient.mutualite).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(id_section[1]),
        format!("\r\t   {}", patient.niss).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(id_section[2]),
        format!("\r\t\t   {}", unidecode(&patient.adresse)).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(id_section[3]),
        format!("\r\t{} {}", patient.cp, unidecode(&patient.localite)).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(id_section[4]),
    ];

    let section_lignes_prestations: Vec<Vec<u8>> = vec![
        format!("\r\t\t      {}", unidecode(&patient.full_name())).into_bytes(),
        // escp_cmds.vertical_spacing(10.0),
        // escp_cmds.vertical_spacing(10.0),
        // escp_cmds.vertical_spacing(10.0),
        // escp_cmds.vertical_spacing(10.0),
        // #[cfg(any(target_os = "macos", target_os = "linux"))]
        // escp_cmds.vertical_spacing(10.52),
        // #[cfg(target_os = "windows")]
        // escp_cmds.vertical_spacing(10.0),
        escp_cmds.vertical_spacing_in_dots(prestations_section[0]),
        escp_cmds.set_to_12_cpi.clone(),
    ]
    .into_iter()
    .chain(lignes_attestation(&escp_cmds, &attestation, prestations_section).into_iter())
    .collect();

    let section_prescription_hospitalisation = vec![
        escp_cmds.set_to_10_cpi.clone(),
        // #[cfg(any(target_os = "macos", target_os = "linux"))]
        // escp_cmds.vertical_spacing(4.7),
        // #[cfg(target_os = "windows")]
        // escp_cmds.vertical_spacing(6.0),
        // escp_cmds.vertical_spacing_in_dots(prescription_section[0]),
        format!(
            "\r\t       {}",
            unidecode(&prescription.prescripteur.full_name())
        )
        .into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[1]),
        format!("\r\t      {}", prescription.date).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[2]),
        format!("\r\t\t\t\t{}", prescription.prescripteur.inami).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[3]),
        format!(
            "\r\t{}",
            if attestation.porte_prescr {
                ""
            } else {
                "*******"
            }
        )
        .into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[4]),
        format!(
            "\r\t         {}",
            if attestation.porte_prescr {
                String::from("*********")
            } else {
                prescription.jointe_a
            }
        )
        .into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[5]),
        format!(
            "\r\t {}",
            if situation_pathologique.numero_etablissement.is_empty()
                && unidecode(&situation_pathologique.service).is_empty()
            {
                "------------  ------"
            } else {
                ""
            }
        )
        .into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[6]),
        format!(
            "\r\t\t\t       {}",
            situation_pathologique.numero_etablissement
        )
        .into_bytes(),
        escp_cmds.vertical_spacing_in_dots(prescription_section[7]),
        format!(
            "\r\t\t\t       {}",
            unidecode(&situation_pathologique.service)
        )
        .into_bytes(),
        // escp_cmds.vertical_spacing_in_dots(prescription_section[8]),
    ];

    let section_signature = vec![
        escp_cmds.vertical_spacing_in_dots(121),
        format!("\r\t\t\t\t{}", attestation.total_recu).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(section_signature_dist[0]),
        format!("\r\t\t{}", unidecode(&kine.full_name())).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(37),
        format!("\r\t\t{}", kine.inami).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(37),
        format!("\r\t\t{}", unidecode(&kine.adresse)).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(37),
        format!("\r\t\t{} {}", kine.cp, unidecode(&kine.localite)).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(120),
        format!("\r\t\t\t      {}", attestation.date).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(166),
    ];

    let section_coupon_remboursement = vec![
        format!("\r\t\t\t    {}", kine.numero_bce).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(79),
        format!("\r\t\t\t      {}", attestation.date).into_bytes(),
        escp_cmds.vertical_spacing_in_dots(87),
        format!("\r\t\t  {}", attestation.total_recu).into_bytes(),
        escp_cmds.form_feed_cmd.clone(),
    ];

    build_binary(
        section_identification_patient
            .into_iter()
            .chain(section_lignes_prestations.into_iter())
            .chain(section_prescription_hospitalisation.into_iter())
            .chain(section_signature.into_iter())
            .chain(section_coupon_remboursement.into_iter())
            .collect(),
    )
}

fn indexed_seance(seances: &Vec<Seance>, index: usize) -> String {
    if index < seances.len() {
        let seance = &seances[index];
        format!("{} {}", seance.date, seance.code_reference)
    } else {
        if index >= 10 && (index - 10) >= seances.len() {
            "\t        ------".to_string()
        } else {
            "------".to_string()
        }
    }
}

fn lignes_attestation(
    escp_cmds: &ESCP,
    attestation: &Attestation,
    spacings: [u16; 11],
) -> Vec<Vec<u8>> {
    let seances = &attestation.seances;
    let mut doc = vec![];
    for index in 0..10 {
        doc.push(format!("\r        {}", indexed_seance(seances, index)).into_bytes());
        doc.push(format!("         {}", indexed_seance(seances, 10 + index)).into_bytes());
        //? en fait on va juste faire ligne par ligne, c'est laid mais c'est ce qu'il y a de plus précis. (J'écoute FF7 Remake Hollow skies en travaillant c'est cool)
        doc.push(escp_cmds.vertical_spacing_in_dots(spacings[index + 1]));
        // if index == 5 {
        //     doc.push(escp_cmds.vertical_spacing(1.5));
        // }
        // if index != 9 {
        //     doc.push(escp_cmds.vertical_spacing(4.32));
        // }
    }
    doc
}
