use tauri::{plugin::TauriPlugin, Runtime};
use tauri_plugin_log::fern::colors::{Color, ColoredLevelConfig};

pub fn build_log_plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_log::Builder::new()
        .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
        .level(log::LevelFilter::Info)
        .level_for("sqlx::query", log::LevelFilter::Warn)
        // .targets([
        //     Target::new(TargetKind::Stdout),
        //     // 将 rust 日志打印到 webview的 devtool 中
        //     Target::new(TargetKind::Webview),
        // ])
        .with_colors(ColoredLevelConfig {
            error: Color::Red,
            warn: Color::Yellow,
            debug: Color::White,
            info: Color::Green,
            trace: Color::White,
        })
        .filter(|metadata| metadata.target().starts_with("webview"))
        .build()
}
