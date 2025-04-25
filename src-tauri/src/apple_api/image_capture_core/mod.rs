pub mod browser_delegate;
pub mod scanner_delegate;

pub mod ImageCaptureCore;

use crate::apple_api::image_capture_core::browser_delegate::MyBrowserDelegate;
use crate::apple_api::image_capture_core::ImageCaptureCore::{
    ICDeviceBrowser, ICDeviceLocationTypeMask, ICDeviceTypeMask,
};
use objc2::rc::Retained;
use objc2::runtime::ProtocolObject;
use objc2_foundation::{ns_string, NSString};
use scanner_delegate::MyScannerDelegate;
use std::cell::RefCell;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use ImageCaptureCore::ICDevice;

use super::state::{ScanOperation, ScannerAPI};

thread_local! {
    pub static SCANNER_API: RefCell<ScannerAPI> = RefCell::new(ScannerAPI::default());
}

pub unsafe fn stop_device_browser() {
    SCANNER_API.with_borrow(|api| {
        if let Some(browser) = &api.device_browser {
            browser.stop();
        }
    });

    println!("🧼 Stopped ICDeviceBrowser");
}

pub fn get_device_browser(
    handler: Option<AppHandle>,
    app_state: Arc<Mutex<Option<ScanOperation>>>,
) -> (Retained<ICDeviceBrowser>, Retained<MyBrowserDelegate>) {
    // Créer le device browser
    let device_browser = unsafe { ICDeviceBrowser::new() };

    // Créer le device browser delegate et l'assigner au device browser
    let browser_delegate = MyBrowserDelegate::new(handler, app_state.clone());
    let object = ProtocolObject::from_ref(&*browser_delegate);
    unsafe { device_browser.setDelegate(Some(object)) };

    // Ajuster les paramètre du device browser pour n'obtenir que les scanners
    println!("We set the delegate : {:?}", device_browser);
    let type_mask = ICDeviceTypeMask::Scanner.0;
    let location_mask = ICDeviceLocationTypeMask::Local.0 | ICDeviceLocationTypeMask::Remote.0;
    let combined = ICDeviceTypeMask(type_mask | location_mask);
    unsafe { device_browser.setBrowsedDeviceTypeMask(combined) };

    // On retourne le device browser fine tuné
    (device_browser, browser_delegate)
}

pub fn find_scanner(expected_device_name: &str) -> Option<Retained<ICDevice>> {
    SCANNER_API.with_borrow(|api| {
        println!("Looking for scanner in the API : {:?}", api.scanners);
        for (device, _) in api.scanners.iter() {
            if unsafe {
                scanner_is_the_one(
                    expected_device_name,
                    device.name().unwrap_or(ns_string!("unknown name").into()),
                )
            } {
                println!("Found expected device");

                return Some(device.clone());
            }
        }
        return None;
    })
}

pub fn open_session(
    device: Retained<ICDevice>,
    scan_ops_related_info: Arc<Mutex<Option<ScanOperation>>>,
) {
    let cloned_arc = scan_ops_related_info.clone();

    let scanner_name = {
        let lock = cloned_arc.lock().unwrap();
        lock.as_ref().map(|info| (info.scanner_name.clone()))
    };

    // Si il y a un scanner à trouver et qu'on l'a on le setup et on ouvre une session avec lui
    if let Some(scanner_name) = scanner_name {
        println!("operation_infos: {:?}", scanner_name);

        if unsafe {
            scanner_is_the_one(
                &scanner_name,
                device.name().unwrap_or(ns_string!("unknown name").into()),
            )
        } {
            println!("Found expected device");
            unsafe {
                println!("Creating and setting scanner delegate");
                device.requestOpenSession();
            }
        }
    }
}

unsafe fn scanner_is_the_one(expected_device_name: &str, device_name: Retained<NSString>) -> bool {
    let expected_ns_string = NSString::from_str(expected_device_name);
    device_name.isEqualToString(&*expected_ns_string)
}
