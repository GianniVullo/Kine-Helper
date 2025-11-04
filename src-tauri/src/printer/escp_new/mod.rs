mod document_builder;
/// ESC/P printer module for attestation form printing
///
/// This module provides functionality to generate ESC/P2 command sequences
/// for matrix printers to print attestation forms.
mod escp_commands;

pub use crate::printer::form_data_modeling::*;
// Re-export the main public API
pub use document_builder::build_document;
pub use escp_commands::{FormSpacing, PrinterConfig};

// Re-export for backward compatibility if needed
pub use document_builder::AttestationDocumentBuilder;
use std::fs::File;
use std::io::Write;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

fn create_test_form_data(
    // config_type: String,
    custom_spacing: Option<FormSpacing>,
) -> DocumentFormData {
    DocumentFormData {
        patient: Patient {
            nom: "Dupont".to_string(),
            prenom: "Jean".to_string(),
            mutualite: "123456".to_string(),
            niss: "12.34.56-789.10".to_string(),
            adresse: "Rue de la Paix 1".to_string(),
            cp: "1000".to_string(),
            localite: "Bruxelles".to_string(),
        },
        prescription: Prescription {
            prescripteur: Prescripteur {
                nom: "Martin".to_string(),
                prenom: "Pierre".to_string(),
                inami: "1-23456-78-901".to_string(),
            },
            date: "01/01/2024".to_string(),
            jointe_a: "12345".to_string(),
        },
        attestation: Attestation {
            porte_prescr: false,
            total_recu: "100.00".to_string(),
            date: "01/02/2024".to_string(),
            seances: vec![
                Seance {
                    date: "01/01/24".to_string(),
                    code_reference: "560011".to_string(),
                },
                Seance {
                    date: "02/01/24".to_string(),
                    code_reference: "560011".to_string(),
                },
            ],
        },
        kine: Kine {
            nom: "Lefebvre".to_string(),
            prenom: "Marie".to_string(),
            inami: "1-98765-43-210".to_string(),
            adresse: "Avenue Louise 100".to_string(),
            cp: "1050".to_string(),
            localite: "Ixelles".to_string(),
            numero_bce: "0123.456.789".to_string(),
        },
        situation_pathologique: SituationPathologique {
            numero_etablissement: "".to_string(),
            service: "".to_string(),
        },
        is_nine_pin: false,
        // config_type,
        custom_spacing,
    }
}

pub fn print_attestation(app_handle: AppHandle, printer_name: String, doc_bytes: Vec<u8>) -> () {
    let file_path = app_handle.path().app_local_data_dir().unwrap();
    let file_path = file_path.join("temp_print_file.prn");
    let mut file = File::create(&file_path).expect("Failed to create file");

    file.write_all(&doc_bytes).expect("Failed to write to file");
    // Construct the lp command
    let shell = app_handle.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command("lp")
            .arg("-d")
            .arg(printer_name)
            .arg(file_path.to_str().unwrap())
            .output()
            .await
            .unwrap()
    });
    if output.status.success() {
        println!("Result: {:?}", String::from_utf8(output.stdout));
    } else {
        println!("Exit with code: {}", output.status.code().unwrap());
    }

    // // Clean up
    // std::fs::remove_file(file_path).expect("Failed to remove temporary file");
    // "true".into()
}

#[tauri::command]
pub fn test_document_generation(
    app_handle: AppHandle,
    // config_type: String,
    custom_spacing: Option<FormSpacing>,
) -> Vec<u8> {
    let form_data = create_test_form_data(custom_spacing);
    let document = build_document(form_data);
    let printer_name = "OKI_DATA_CORP_ML1120";
    println!("{:?}", &document);
    let _ = print_attestation(app_handle, printer_name.to_string(), document.clone());
    // Check that document starts with form length command
    // assert_eq!(&document[0..4], &[0x1b, 0x43, 0x00, 0x0c]);

    // Check that document ends with form feed
    // let last_byte = document[document.len() - 1];
    // assert_eq!(last_byte, 0x0c);

    // Document should have reasonable size
    // assert!(document.len() > 100);
    // assert!(document.len() < 10000);
    document
}
