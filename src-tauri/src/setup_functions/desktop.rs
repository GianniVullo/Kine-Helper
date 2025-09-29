use crate::database_migrations::build_migrations;
use crate::setup_functions::commons::build_log_plugin;
use tauri::Runtime;

pub trait CustomInit {
    fn init_plugin(self) -> Self;
}

impl<R: Runtime> CustomInit for tauri::Builder<R> {
    fn init_plugin(self) -> Self {
        self.plugin(tauri_plugin_os::init())
            // .plugin(tauri_plugin_apple_camera::init())
            // .plugin(tauri_plugin_notification::init())
            .plugin(tauri_plugin_process::init())
            // .plugin(tauri_plugin_upload::init())
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_shell::init())
            .plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_dialog::init())
            // .plugin(tauri_plugin_clipboard_manager::init())
            // .plugin(tauri_plugin_opener::init())
            // .plugin(tauri_plugin_autostart::init(
            //     MacosLauncher::LaunchAgent,
            //     Some(vec!["--flag1", "--flag2"]),
            // ))
            // .plugin(tauri_plugin_single_instance::init(|app, _args, _cmd| {
            //     let windows = app.webview_windows();
            //     // home
            //     for (name, window) in windows {
            //         if name == "home" {
            //             window.show().unwrap();
            //             window.unminimize().unwrap();
            //             window.set_focus().unwrap();
            //             break;
            //         }
            //     }
            // }))
            .plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations("sqlite:kinehelper2.db", build_migrations())
                    .build(),
            )
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_updater::Builder::new().build())
            // .plugin(tauri_plugin_mic_recorder::init())
            .plugin(build_log_plugin())
    }
}

// avant :
// .plugin(
//     tauri_plugin_log::Builder::new()
//         .filter(|metadata| metadata.target().starts_with("webview"))
//         .build(),
// )
