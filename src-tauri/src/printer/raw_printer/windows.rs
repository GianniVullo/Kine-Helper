use crate::printer::{escp::build_document, form_data_modeling::DocumentFormData};
use std::ffi::CString;
use std::ptr;
use windows::core::{PCSTR, PSTR};
use windows::Win32::Foundation::{GetLastError, HANDLE};
use windows::Win32::Graphics::Printing::{
    ClosePrinter, EndDocPrinter, EndPagePrinter, OpenPrinterA, StartDocPrinterA, StartPagePrinter,
    WritePrinter, DOC_INFO_1A, PRINTER_ALL_ACCESS, PRINTER_DEFAULTSA,
};
use tauri::AppHandle;

#[tauri::command]
pub fn print_attestation(_app_handle: AppHandle, printer_name: &str, form_data: DocumentFormData) {
    println!("In the print_attestation fn with {}", printer_name);
    let printer_name = CString::new(printer_name).unwrap();
    let mut printer_handle = HANDLE(0);
    unsafe {
        println!("Now in the unsafe tag");
        let pd = PRINTER_DEFAULTSA {
            pDatatype: PSTR(ptr::null_mut()),
            pDevMode: ptr::null_mut(),
            DesiredAccess: PRINTER_ALL_ACCESS,
        };
        println!("now after the pd {:#?}", pd);

        if OpenPrinterA(
            PCSTR(printer_name.as_bytes().as_ptr()),
            &mut printer_handle,
            Some(&pd),
        )
        .is_ok()
        {
            println!(
                "now the handle is populated here it is : {:#?}",
                printer_handle
            );
            let doc_info = DOC_INFO_1A {
                pDocName: PSTR("My Document\0".as_ptr() as *mut u8),
                pOutputFile: PSTR::null(),
                pDatatype: PSTR("RAW\0".as_ptr() as *mut u8),
            };
            println!("the docinfo {:#?}", doc_info);
            // Start the document
            let job = StartDocPrinterA(printer_handle, 1, &doc_info as *const _ as _);
            println!("the job is now started {:#?}", job);
            if job == 0 {
                println!("{:#?}", GetLastError());
                return;
            }

            // Start the page
            if !StartPagePrinter(printer_handle).as_bool() {
                println!("{:#?}", GetLastError());
                return;
            }

            let buffer = build_document(form_data);

            let mut bytes_written: u32 = 0;
            if !WritePrinter(
                printer_handle,
                buffer.as_ptr() as _,
                buffer.len() as u32,
                &mut bytes_written,
            )
            .as_bool()
            {
                println!("{:#?}", GetLastError());
            }
            println!("now over and closing stuff");
            // End the page and document
            EndPagePrinter(printer_handle);
            EndDocPrinter(printer_handle);
            let _ = ClosePrinter(printer_handle);
            // let ok1 = Ok(bytes_written as usize);
        } else {
            println!("{:#?}", GetLastError());
        }
    }
}
