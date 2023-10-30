// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // let client = sentry_tauri::sentry::init((
    //     "__YOUR_DSN__",
    //     sentry_tauri::sentry::ClientOptions {
    //         release: sentry_tauri::sentry::release_name!(),
    //         ..Default::default()
    //     },
    // ));

    // Everything before here runs in both app and crash reporter processes
    // let _guard = sentry_tauri::minidump::init(&client);
    // Everything after here runs in only the app process
    tauri::Builder::default()
        .plugin(tauri_plugin_window::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
