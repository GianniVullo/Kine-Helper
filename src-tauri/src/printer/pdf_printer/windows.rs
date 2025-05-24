use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;
use winprint::printer::{FilePrinter, PdfiumPrinter, PrinterDevice};

#[tauri::command]
pub async fn get_printers() -> Result<Vec<String>, String> {
    let printers = PrinterDevice::all();

    match printers {
        Ok(ps) => Ok(ps.into_iter().map(|p| p.name()).collect()),

        Err(err) => {
            return Err(err.to_string());
        }
    }
}

#[tauri::command]
pub async fn print_pdf(
    app_handle: AppHandle,
    printer_name: String,
    file_path: String,
) -> Result<String, String> {
    // TODO: Implement the Windows version of the print_pdf function
    Ok("Print job submitted successfully".into())
}

fn print_pdf(printer_name: String, file_path: String) -> Result<String, String> {
    let printer = match get_printers() {
        Ok(printers) => match printers
            .into_iter()
            .find(|printer| printer.name() == printer_name)
        {
            Some(prn) => prn,

            None => {
                return Err("Cannot find selected printer".to_string());
            }
        },

        Err(err) => {
            return Err(err);
        }
    };

    let pdf_printer = PdfiumPrinter::new(printer);

    let path = Path::new(&file_path);
    if !path.exists() {
        return Err("File does not exist".to_string());
    }
    if !path.is_file() {
        return Err("Path is not a file".to_string());
    }

    let _printing = match pdf_printer.print(path, Default::default()) {
        Ok(status) => {
            return Ok("Done".to_string());
        }

        Err(err) => {
            return Err(err.to_string());
        }
    };
}
