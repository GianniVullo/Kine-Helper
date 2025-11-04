// use crate::printer::escp_new::escp_commands::{
    // EscpCommandBuilder, FormSpacing, PrinterConfig,
// };
use crate::printer::form_data_modeling::{Attestation, DocumentFormData};
use unidecode::unidecode;

/// Document section trait for rendering different parts of the form
trait DocumentSection {
    fn render(&self, commands: &EscpCommandBuilder, spacing: &FormSpacing) -> Vec<Vec<u8>>;
}

/// Patient identification section
struct IdentificationSection<'a> {
    patient: &'a crate::printer::form_data_modeling::Patient,
}

impl<'a> DocumentSection for IdentificationSection<'a> {
    fn render(&self, commands: &EscpCommandBuilder, spacing: &FormSpacing) -> Vec<Vec<u8>> {
        vec![
            commands.set_form_length_12_inch(),
            commands.vertical_spacing_dots(spacing.initial_spacing),
            EscpCommandBuilder::text_line(&unidecode(&self.patient.full_name()), 2),
            commands.vertical_spacing_dots(spacing.id_name_to_mutuality),
            EscpCommandBuilder::text_line(&self.patient.mutualite, 2),
            commands.vertical_spacing_dots(spacing.id_mutuality_to_niss),
            EscpCommandBuilder::text_line(&self.patient.niss, 1),
            commands.vertical_spacing_dots(spacing.id_niss_to_address),
            EscpCommandBuilder::text_line(&unidecode(&self.patient.adresse), 2),
            commands.vertical_spacing_dots(spacing.id_address_to_postal),
            EscpCommandBuilder::text_line(
                &format!("{} {}", self.patient.cp, unidecode(&self.patient.localite)),
                1,
            ),
            commands.vertical_spacing_dots(spacing.id_postal_to_next),
        ]
    }
}

/// Prestations (services) section
struct PrestationsSection<'a> {
    patient_name: String,
    attestation: &'a Attestation,
}

impl<'a> PrestationsSection<'a> {
    fn format_seance(&self, index: usize) -> String {
        if index < self.attestation.seances.len() {
            let seance = &self.attestation.seances[index];
            format!("{} {}", seance.date, seance.code_reference)
        } else {
            if index >= 10 && (index - 10) >= self.attestation.seances.len() {
                "\t        ------".to_string()
            } else {
                "------".to_string()
            }
        }
    }
}

impl<'a> DocumentSection for PrestationsSection<'a> {
    fn render(&self, commands: &EscpCommandBuilder, spacing: &FormSpacing) -> Vec<Vec<u8>> {
        let mut section = vec![
            EscpCommandBuilder::text_line(&self.patient_name, 2),
            commands.vertical_spacing_dots(spacing.prest_name_to_table),
            commands.set_12_cpi(),
        ];

        // Add 10 lines of prestations (2 columns of seances)
        for i in 0..10 {
            let left_seance = self.format_seance(i);
            let right_seance = self.format_seance(10 + i);

            section
                .push(format!("\r        {}         {}", left_seance, right_seance).into_bytes());
            section.push(commands.vertical_spacing_dots(spacing.prest_lines[i]));
        }

        section
    }
}

/// Prescription and hospitalization section
struct PrescriptionSection<'a> {
    prescription: &'a crate::printer::form_data_modeling::Prescription,
    attestation: &'a Attestation,
    situation: &'a crate::printer::form_data_modeling::SituationPathologique,
}

impl<'a> DocumentSection for PrescriptionSection<'a> {
    fn render(&self, commands: &EscpCommandBuilder, spacing: &FormSpacing) -> Vec<Vec<u8>> {
        let establishment_service = if self.situation.numero_etablissement.is_empty()
            && unidecode(&self.situation.service).is_empty()
        {
            "------------  ------"
        } else {
            ""
        };

        vec![
            commands.set_10_cpi(),
            EscpCommandBuilder::text_line(
                &unidecode(&self.prescription.prescripteur.full_name()),
                1,
            ),
            commands.vertical_spacing_dots(spacing.presc_spacing[0]),
            EscpCommandBuilder::text_line(&self.prescription.date, 1),
            commands.vertical_spacing_dots(spacing.presc_spacing[1]),
            EscpCommandBuilder::text_line(&self.prescription.prescripteur.inami, 4),
            commands.vertical_spacing_dots(spacing.presc_spacing[2]),
            EscpCommandBuilder::text_line(
                if self.attestation.porte_prescr {
                    ""
                } else {
                    "*******"
                },
                1,
            ),
            commands.vertical_spacing_dots(spacing.presc_spacing[3]),
            EscpCommandBuilder::text_line(
                &if self.attestation.porte_prescr {
                    String::from("*********")
                } else {
                    self.prescription.jointe_a.clone()
                },
                2,
            ),
            commands.vertical_spacing_dots(spacing.presc_spacing[4]),
            EscpCommandBuilder::text_line(establishment_service, 1),
            commands.vertical_spacing_dots(spacing.presc_spacing[5]),
            EscpCommandBuilder::text_line(&self.situation.numero_etablissement, 3),
            commands.vertical_spacing_dots(spacing.presc_spacing[6]),
            EscpCommandBuilder::text_line(&unidecode(&self.situation.service), 3),
        ]
    }
}

/// Signature section
struct SignatureSection<'a> {
    attestation: &'a Attestation,
    kine: &'a crate::printer::form_data_modeling::Kine,
}

impl<'a> DocumentSection for SignatureSection<'a> {
    fn render(&self, commands: &EscpCommandBuilder, spacing: &FormSpacing) -> Vec<Vec<u8>> {
        vec![
            commands.vertical_spacing_dots(121),
            EscpCommandBuilder::text_line(&self.attestation.total_recu, 4),
            commands.vertical_spacing_dots(spacing.sign_total_to_name),
            EscpCommandBuilder::text_line(&unidecode(&self.kine.full_name()), 2),
            commands.vertical_spacing_dots(spacing.sign_name_line_spacing),
            EscpCommandBuilder::text_line(&self.kine.inami, 2),
            commands.vertical_spacing_dots(spacing.sign_name_line_spacing),
            EscpCommandBuilder::text_line(&unidecode(&self.kine.adresse), 2),
            commands.vertical_spacing_dots(spacing.sign_name_line_spacing),
            EscpCommandBuilder::text_line(
                &format!("{} {}", self.kine.cp, unidecode(&self.kine.localite)),
                2,
            ),
            commands.vertical_spacing_dots(spacing.sign_after_location),
            EscpCommandBuilder::text_line(&self.attestation.date, 3),
            commands.vertical_spacing_dots(166),
        ]
    }
}

/// Reimbursement coupon section
struct RemboursementSection<'a> {
    attestation: &'a Attestation,
    kine: &'a crate::printer::form_data_modeling::Kine,
}

impl<'a> DocumentSection for RemboursementSection<'a> {
    fn render(&self, commands: &EscpCommandBuilder, spacing: &FormSpacing) -> Vec<Vec<u8>> {
        vec![
            EscpCommandBuilder::text_line(&self.kine.numero_bce, 3),
            commands.vertical_spacing_dots(spacing.remb_to_bce),
            EscpCommandBuilder::text_line(&self.attestation.date, 3),
            commands.vertical_spacing_dots(spacing.remb_bce_to_date),
            EscpCommandBuilder::text_line(&self.attestation.total_recu, 2),
            commands.form_feed(),
        ]
    }
}

/// Main document builder
pub struct AttestationDocumentBuilder {
    commands: EscpCommandBuilder,
    spacing: FormSpacing,
}

impl AttestationDocumentBuilder {
    /// Create a new document builder with the specified printer configuration
    pub fn new(is_nine_pin: bool) -> Self {
        let config = if is_nine_pin {
            PrinterConfig::nine_pin()
        } else {
            PrinterConfig::twenty_four_pin()
        };

        let spacing = if is_nine_pin {
            FormSpacing::nine_pin_default()
        } else {
            FormSpacing::twenty_four_pin_default()
        };

        Self {
            commands: EscpCommandBuilder::new(config),
            spacing,
        }
    }

    /// Build the complete document from form data
    pub fn build_document(&self, form_data: DocumentFormData) -> Vec<u8> {
        let sections: Vec<Box<dyn DocumentSection>> = vec![
            Box::new(IdentificationSection {
                patient: &form_data.patient,
            }),
            Box::new(PrestationsSection {
                patient_name: unidecode(&form_data.patient.full_name()),
                attestation: &form_data.attestation,
            }),
            Box::new(PrescriptionSection {
                prescription: &form_data.prescription,
                attestation: &form_data.attestation,
                situation: &form_data.situation_pathologique,
            }),
            Box::new(SignatureSection {
                attestation: &form_data.attestation,
                kine: &form_data.kine,
            }),
            Box::new(RemboursementSection {
                attestation: &form_data.attestation,
                kine: &form_data.kine,
            }),
        ];

        let mut all_commands = Vec::new();
        all_commands.extend_from_slice(&[self.commands.initialize_printer()]);

        for section in sections {
            all_commands.extend(section.render(&self.commands, &self.spacing));
        }

        EscpCommandBuilder::build_binary(all_commands)
    }
}

/// Public API - maintains backward compatibility
pub fn build_document(form_data: DocumentFormData) -> Vec<u8> {
    let builder = AttestationDocumentBuilder::new(form_data.is_nine_pin);
    builder.build_document(form_data)
}
