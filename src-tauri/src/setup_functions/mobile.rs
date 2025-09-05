use crate::database_migrations::build_migrations;
use crate::setup_functions::commons::build_log_plugin;
use tauri::Runtime;

pub trait CustomInit {
    fn init_plugin(self) -> Self;
}

impl<R: Runtime> CustomInit for tauri::Builder<R> {
    fn init_plugin(self) -> Self {
        let builder = self
            .plugin(tauri_plugin_os::init())
            // .plugin(tauri_plugin_notification::init())
            // .plugin(tauri_plugin_process::init())
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_shell::init())
            .plugin(tauri_plugin_fs::init())
            // .plugin(tauri_plugin_upload::init())
            .plugin(tauri_plugin_dialog::init())
            .plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations("sqlite:kinehelper.db", build_migrations())
                    .build(),
            )
            .plugin(build_log_plugin());
        // .plugin(tauri_plugin_clipboard_manager::init())
        // .plugin(tauri_plugin_opener::init())

        builder
    }
}
