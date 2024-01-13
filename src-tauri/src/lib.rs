mod nomenclature;
mod printer;
use nomenclature::convention_decompression;
use tauri_plugin_sql::{Migration, MigrationKind};
#[cfg(any(target_os = "macos", target_os = "linux"))]
use printer::raw_printer::unix::print_attestation;
#[cfg(target_os = "windows")]
use printer::raw_printer::windows::print_attestation;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:kinehelper.db",
                    vec![Migration {
                        version: 0,
                        description: "Conventions",
                        sql: include_str!("migrations/20231204175351_conventions.up.sql"),
                        kind: MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        // .plugin(sentry_tauri::plugin())
        .invoke_handler(tauri::generate_handler![convention_decompression, print_attestation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
