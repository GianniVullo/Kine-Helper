mod image_capture_core;
pub mod state;

use image_capture_core::browser_delegate::MyBrowserDelegate;
use image_capture_core::ImageCaptureCore::ICDeviceBrowser;
use image_capture_core::{find_scanner, stop_device_browser};
use objc2::rc::{autoreleasepool, Retained};
use objc2::MainThreadMarker;
use objc2_app_kit::NSApplication;
use objc2_foundation::ns_string;
use state::ScanOperation;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;

use super::apple_api::image_capture_core::{get_device_browser, SCANNER_API};

/**
 ** - first we ensure we are on the main thread
 ** - We check if the app is running
 ** - we run the code either
 **     - start browsing for devices
 **         - ensure we have no scan ops info (otherwise the code will launch a scan)
 **         - try to get the browser from the thread_local
 **         - if yes start it if no create it then start it
 **         - create and set the delegate
 **         - store the devices found in a thread_local along with a delegate
 **     - Start a scan
 **         - set the scan ops info
 **         - try to get the ICScanner from the thread_local SCANNERAPI
 **         - request open session
 **         - request scan
 **         - compress the image
 **         - Store the image in the scannerAPI.document_path
 **         - return the bytes of the image
 * TODO - On redimensionne et on reconvertis l'image récupérée et on la renvoie
 */

#[tauri::command]
pub async fn get_scanners(
    app: AppHandle,
    app_state: tauri::State<'_, Arc<Mutex<Option<ScanOperation>>>>,
) -> Result<Vec<String>, String> {
    check_if_app_is_running(|_| {
        set_scan_related_infos(app_state.clone(), None);
        let started = start_device_browser(app, app_state.inner().clone());
        match started {
            // In this case we wait the device browser to send the devices via tauri event system
            Ok(_) => return Ok(vec![]),
            Err(_) => {
                // Cela signifie que le device browser effectue déjà sa recherche on peut donc retourner SCANNER_API.scanners
                println!("The device browser is already running");
                return SCANNER_API.with_borrow(|api| {
                    println!("the api Scanners are {:?}", api.scanners);
                    return Ok(api
                        .scanners
                        .iter()
                        .map(|scanner| {
                            let scanner_name = unsafe {
                                scanner
                                    .0
                                    .name()
                                    .unwrap_or(ns_string!("unknown device").into())
                            };
                            let extracted_s_name = autoreleasepool(|pool| {
                                return unsafe {
                                    scanner_name.to_str(pool).to_string()
                                    // .expect("Failed to convert to string")
                                };
                            });
                            extracted_s_name.to_string()
                        })
                        .collect());
                });
                return Err("API".to_string());
            }
        }
    })
}

#[tauri::command]
pub async fn get_scan(
    app_state: tauri::State<'_, Arc<Mutex<Option<ScanOperation>>>>,
    scan_ops_related_info: ScanOperation,
) -> Result<String, String> {
    check_if_app_is_running(|_| {
        let expected_device_name: String = scan_ops_related_info.scanner_name.clone();
        set_scan_related_infos(app_state.clone(), Some(scan_ops_related_info));
        // try to get the ICScannerDevice from the thread_local SCANNERAPI
        let scanner = find_scanner(&expected_device_name);
        if let Some(scanner) = scanner {
            unsafe { scanner.requestOpenSession() };
            Ok("Scanner session opened".to_string())
        } else {
            return Err("Scanner not found".to_string());
        }
    })
}

fn set_scan_related_infos(
    app_state: tauri::State<'_, Arc<Mutex<Option<ScanOperation>>>>,
    scan_ops_related_info: Option<ScanOperation>,
) -> () {
    let mut scan_ops_infos = app_state.lock().unwrap();
    *scan_ops_infos = scan_ops_related_info;
}

#[tauri::command]
pub async fn stop_browsing() -> Result<String, String> {
    unsafe { stop_device_browser() };
    Ok("Device browser stopped".to_string())
}

fn start_device_browser(
    app: AppHandle,
    app_state: Arc<Mutex<Option<ScanOperation>>>,
) -> Result<(), bool> {
    SCANNER_API.with_borrow_mut(|api| {
        println!("the api is some {:?}", api.device_browser.is_some());
        if api.device_browser.is_some() {
            println!("The device browser is already running");
            return Err(false);
        } else {
            let (device_browser, delegate) = get_device_browser(Some(app), app_state);
            unsafe { device_browser.start() };
            api.device_browser = Some(device_browser);
            api.browser_delegate = Some(delegate);
            return Ok(());
        }
    })
}

fn check_if_app_is_running<R: Send, F: FnOnce(MainThreadMarker) -> R + Send>(run: F) -> R {
    if let Some(mtm) = MainThreadMarker::new() {
        let ns_app = NSApplication::sharedApplication(mtm);
        if unsafe { ns_app.isRunning() } {
            run(mtm)
        } else {
            panic!("You are running RFD in NonWindowed environment, it is impossible to spawn dialog from thread different than main in this env.")
        }
    } else {
        let mtm = unsafe { MainThreadMarker::new_unchecked() };
        let ns_app = NSApplication::sharedApplication(mtm);
        if unsafe { ns_app.isRunning() } {
            dispatch2::run_on_main(run)
        } else {
            panic!("You are running RFD in NonWindowed environment, it is impossible to spawn dialog from thread different than main in this env.")
        }
    }
}
