use crate::printer::{escp::build_document, form_data_modeling::DocumentFormData};
use std::fs::File;
use std::io::Write;
use std::path::Path;
use std::process::Command;

#[tauri::command]
pub fn print_attestation(printer_name: &str, form_data: DocumentFormData) {
    // Create a file with raw ESC/P commands
    let file_path = Path::new("temp_print_file.prn");
    let mut file = File::create(&file_path).expect("Failed to create file");
    for line in build_document(form_data).content {
        write!(file, "{}", line).expect("Failed to write to file");   
    }
    // Construct the lp command
    let output = Command::new("lp")
        .arg("-d")
        .arg(printer_name)
        .arg(file_path.to_str().unwrap())
        .output()
        .expect("Failed to execute command");

    if output.status.success() {
        println!("Print job sent successfully.");
    } else {
        eprintln!("Error: {}", String::from_utf8_lossy(&output.stderr));
    }

    // Clean up
    std::fs::remove_file(file_path).expect("Failed to remove temporary file");
}
