#[cfg(any(target_os = "macos", target_os = "linux"))]
pub mod unix;

#[cfg(target_os = "windows")]
pub mod windows;
