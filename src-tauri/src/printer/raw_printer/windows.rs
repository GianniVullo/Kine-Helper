use windows::Win32::Foundation::{HANDLE, CloseHandle};
use windows::Win32::Graphics::Printing::{OpenPrinterW, StartDocPrinterW, DOC_INFO_1W, StartPagePrinter, WritePrinter, EndPagePrinter, EndDocPrinter, ClosePrinter};
use windows::Win32::System::SystemServices::GENERIC_WRITE;
use std::ptr::null_mut;
use windows::core::PWSTR;
use crate::printer::{escp::build_document, form_data_modeling::DocumentFormData};

#[tauri::command]
pub fn print_attestation(printer_name: &str, form_data: DocumentFormData) {
    unsafe {
        let printer_name_wide: Vec<u16> = printer_name.encode_utf16().chain(Some(0)).collect();
        let mut printer_handle: HANDLE = HANDLE(0);

        // Open the printer
        if OpenPrinterW(PWSTR(printer_name_wide.as_ptr() as *mut _), &mut printer_handle, null_mut()).as_bool() {
            let doc_info = DOC_INFO_1W {
                pDocName: PWSTR("My Document".encode_utf16().chain(Some(0)).collect::<Vec<u16>>().as_ptr() as *mut _),
                pOutputFile: PWSTR(null_mut()),
                pDatatype: PWSTR("RAW".encode_utf16().chain(Some(0)).collect::<Vec<u16>>().as_ptr() as *mut _),
            };

            // Start the document
            if StartDocPrinterW(printer_handle, 1, &doc_info).as_bool() {
                if StartPagePrinter(printer_handle).as_bool() {
                    let data = build_document(form_data).content;
                    let mut bytes_written = 0;

                    // Write the data to the printer
                    if WritePrinter(printer_handle, data.as_ptr() as *const _, data.len() as u32, &mut bytes_written).as_bool() {
                        EndPagePrinter(printer_handle);
                    }
                    EndDocPrinter(printer_handle);
                }
            }

            // Close the printer
            ClosePrinter(printer_handle);
        }
    }
    println!("Sent test print to {}", printer_name);
}
