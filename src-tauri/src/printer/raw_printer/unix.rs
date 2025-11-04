use crate::printer::{escp::build_document, form_data_modeling::DocumentFormData};
use std::fs::File;
use std::io::Write;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub fn print_attestation(
    app_handle: AppHandle,
    printer_name: String,
    form_data: DocumentFormData,
    spacings: Option<([u16; 6], [u16; 11], [u16; 9], [u16; 5], [u16; 2])>,
) -> () {
    let file_path = app_handle.path().app_local_data_dir().unwrap();
    let file_path = file_path.join("temp_print_file.prn");
    let mut file = File::create(&file_path).expect("Failed to create file");

    let doc_bytes = build_document(form_data, spacings);

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
