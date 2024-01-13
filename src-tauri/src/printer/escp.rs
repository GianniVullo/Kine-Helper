use crate::printer::form_data_modeling::{DocumentFormData, EscpDocument};

pub fn build_document(form_data: DocumentFormData) -> EscpDocument {
    let mut doc = EscpDocument::new();
    let DocumentFormData { patient, prescription, attestation, kine, situation_pathologique } = form_data;

    doc.set_page_length_12_inch();
    doc.vertical_move(60); // \x1b\x4a\x3c
    doc.add_text(&format!("\t\t     {}", patient.full_name()));
    doc.vertical_move(108); // \x1b\x4a\x6c
    doc.add_text(&format!("\r\t\t   {}", patient.mutualite));
    doc.vertical_move(45); // \x1b\x4a\x2d
    doc.add_text(&format!("\r\t   {}", patient.niss));
    doc.vertical_move(63); // \x1b\x4a\x3f
    doc.add_text(&format!("\r\t\t   {}", patient.adresse));
    doc.vertical_spacing(4.32);
    doc.add_text(&format!("\r\t{} {}", patient.cp, patient.localite));
    doc.vertical_move(125); // \x1b\x4a\x7d
    doc.vertical_move(17); // \x1b\x4a\x11
    doc.add_text(&format!("\r\t\t      {}", patient.full_name()));
    // Repeated vertical spacing
    for _ in 0..4 {
        doc.vertical_spacing(10.0);
    }
    doc.vertical_move(64); // \x1b\x4a\x40
    doc.set_12_cpi();
    // ... (assuming lignesAttestation is handled separately) ...
    doc.set_10_cpi();
    doc.vertical_move(40); // \x1b\x4a\x28
    doc.add_text(&format!("\r\t       {}", prescription.prescripteur.full_name()));
    doc.vertical_move(41); // \x1b\x4a\x29
    doc.add_text(&format!("\r\t      {}", prescription.date));
    doc.vertical_move(38); // \x1b\x4a\x26
    doc.add_text(&format!("\r\t\t\t\t{}", prescription.prescripteur.inami));
    doc.vertical_move(38); // \x1b\x4a\x26
    doc.vertical_move(51); // \x1b\x4a\x33
    doc.vertical_move(25); // \x1b\x4a\x19
    doc.add_text(&format!("\r\t{}", if attestation.porte_prescr { "" } else { "*******" }));
    doc.vertical_move(16); // \x1b\x4a\x10
    doc.add_text(&format!("\r\t         {}", if attestation.porte_prescr { "---------" } else { &attestation.date }));
    doc.vertical_move(32); // \x1b\x4a\x20
    doc.add_text(&format!("\r\t{}", if situation_pathologique.numero_etablissment.is_empty() && situation_pathologique.service.is_empty() { "------------  ------" } else { "" }));
    doc.vertical_move(13); // \x1b\x4a\x0d
    doc.add_text(&format!("\r\t\t\t       {}", situation_pathologique.numero_etablissment));
    doc.vertical_move(34); // \x1b\x4a\x22
    doc.add_text(&format!("\r\t\t\t       {}", situation_pathologique.service));
    doc.vertical_spacing(10.0);
    doc.vertical_move(32); // \x1b\x4a\x20
    doc.add_text(&format!("\r\t\t\t\t{}", attestation.total_recu));
    doc.vertical_spacing(10.0);
    doc.add_text(&format!("\r\t\t{}", kine.full_name()));
    doc.vertical_spacing(4.32);
    doc.add_text(&format!("\r\t\t{}", kine.inami));
    doc.vertical_spacing(4.32);
    doc.add_text(&format!("\r\t\t{},", kine.adresse));
    doc.vertical_spacing(4.32);
    doc.add_text(&format!("\r\t\t{} {}", kine.cp, kine.localite));
    doc.vertical_spacing(10.0);
    doc.vertical_move(80); // \x1b\x4a\x50
    doc.add_text(&format!("\r\t\t\t      {}", attestation.date));
    doc.vertical_spacing(10.0);
    doc.vertical_spacing(10.0);
    doc.add_text(&format!("\r\t\t\t    {}", kine.numero_bce));
    doc.vertical_spacing(10.0);
    doc.add_text(&format!("\r\t\t\t      {}", attestation.date));
    doc.vertical_spacing(10.0);
    doc.add_text(&format!("\r\t\t  {}", attestation.total_recu));
    doc.form_feed();

    doc
}
