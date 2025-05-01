use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub fn print_pdf(
    app_handle: AppHandle,
    printer_name: String,
    file_path: String,
) -> Result<String, String> {
    // Construct the lp command
    let shell = app_handle.shell();
    let output = tauri::async_runtime::block_on(async move {
        shell
            .command("lp")
            .arg("-d")
            .arg(printer_name)
            .arg(file_path)
            .output()
            .await
            .unwrap()
    });
    if output.status.success() {
        println!("Result: {:?}", String::from_utf8(output.stdout));
        return Ok("Print job submitted successfully".into());
    } else {
        println!("Exit with code: {}", output.status.code().unwrap());
        return Err(format!(
            "Failed to submit print job: {}",
            String::from_utf8(output.stderr).unwrap_or_default()
        ));
    }
}
