use crate::printer::{escp::build_document, form_data_modeling::DocumentFormData};
use std::ptr::null_mut;
use windows::core::PWSTR;
use windows::Win32::Foundation::{CloseHandle, HANDLE};
use windows::Win32::Graphics::Printing::{
    ClosePrinter, EndDocPrinter, EndPagePrinter, OpenPrinterW, StartDocPrinterW, StartPagePrinter,
    WritePrinter, DOC_INFO_1W,
};
use windows::Win32::System::SystemServices::GENERIC_WRITE;

#[tauri::command]
pub fn print_attestation(printer_name: &str, form_data: DocumentFormData) -> String {
    let printers_list: Vec<printers::printer::Printer> = printers::get_printers();
    let printer = printers_list
        .iter()
        .find(|&x: printers::printer::Printer| x.system_name == printer_name);
    match printers::print(&printers::get_printers()[0].name, b"frzerg", None) {
        Ok(done) => {
            if done {
                "true".into()
            } else {
                "false".into()
            }
        }
        Err(e) => e,
    }
}
