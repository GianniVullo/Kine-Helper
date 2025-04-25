use crate::apple_api::image_capture_core::ImageCaptureCore::*;
use crate::apple_api::image_capture_core::SCANNER_API;
use crate::apple_api::state::ScanOperation;
use objc2::rc::autoreleasepool;
use objc2::rc::Retained;
use objc2::runtime::ProtocolObject;
use objc2::AllocAnyThread;
use objc2::DefinedClass;
use objc2::Message;
use objc2::{define_class, msg_send};
use objc2_foundation::{ns_string, NSObject, NSObjectProtocol, NSString};
use tauri::{AppHandle, Emitter};

use crate::apple_api::image_capture_core::scanner_delegate::MyScannerDelegate;
// use crate::apple_api::image_capture_core::stop_device_browser;
use std::cell::RefCell;
use std::sync::Arc;
use std::sync::Mutex;

thread_local! {
    static SCANNER_DELEGATE: RefCell<Option<Retained<MyScannerDelegate>>> = RefCell::new(None);
}

#[derive(Debug)]
pub struct Ivars {
    tauri_event_emiter: Option<AppHandle>,
    scan_ops_related_info: Arc<Mutex<Option<ScanOperation>>>,
}

define_class!(
    #[derive(Debug)]
    #[unsafe(super(NSObject))]
    #[name = "MyBrowserDelegate"]
    #[ivars = Ivars]
    pub struct MyBrowserDelegate;

    unsafe impl NSObjectProtocol for MyBrowserDelegate {}

    unsafe impl ICDeviceBrowserDelegate for MyBrowserDelegate {
        #[unsafe(method(deviceBrowser:didAddDevice:moreComing:))]
        fn deviceBrowser_didAddDevice_moreComing(
            &self,
            browser: &ICDeviceBrowser,
            device: &ICDevice,
            more_coming: bool,
        ) {
            let device_type = unsafe { device.r#type() };
            println!("Device added with type {:?}", device_type);
            if device_type == ICDeviceType(258) || device_type == ICDeviceType(1026) {
                println!("Device is a scanner");
                SCANNER_API.with_borrow_mut(|api| {
                    let retained_device = unsafe { produceRetained(device) };
                    let device_tuple = (
                        retained_device,
                        Some(unsafe {
                            setup_scanner_delegate(
                                device,
                                self.ivars().tauri_event_emiter.clone(),
                                self.ivars().scan_ops_related_info.clone(),
                            )
                        }),
                    );
                    println!("pushing devive_tuple {:?}", device_tuple.0);
                    api.scanners.push(device_tuple);
                });
                if let Some(tauri_event_emiter) = self.ivars().tauri_event_emiter.as_ref() {
                    println!("Emitting event");
                    autoreleasepool(|pool| {
                        let mut name = unsafe {
                            device
                                .name()
                                .unwrap_or(ns_string!("unknown name").into())
                                .to_str(pool)
                                .to_string()
                        };
                        println!("Device name: {:?}", name);
                        if !more_coming {
                            name = format!("{}-{}", name, "end");
                        }
                        let _ = tauri_event_emiter.emit("added_device", name);
                    });
                }
            }
        }

        #[unsafe(method(deviceBrowser:didRemoveDevice:moreGoing:))]
        fn deviceBrowser_didRemoveDevice_moreGoing(
            &self,
            _browser: &ICDeviceBrowser,
            _device: &ICDevice,
            _more_going: bool,
        ) {
            println!("Device removed");
            SCANNER_API.with_borrow_mut(|api| {
                api.scanners.retain(|(device, _)| {
                    autoreleasepool(|pool| {
                        let device_name = unsafe {
                            device
                                .name()
                                .unwrap_or(ns_string!("unknown name").into())
                                .to_str(pool)
                                .to_string()
                        };
                        let removed_device_name = unsafe {
                            _device
                                .name()
                                .unwrap_or(ns_string!("unknown name").into())
                                .to_str(pool)
                                .to_string()
                        };
                        println!("Device name: {:?}", device_name);
                        device_name != removed_device_name
                    })
                });
            });
            if let Some(tauri_event_emiter) = self.ivars().tauri_event_emiter.as_ref() {
                println!("Emitting event");
                autoreleasepool(|pool| {
                    let name = unsafe {
                        _device
                            .name()
                            .unwrap_or(ns_string!("unknown name").into())
                            .to_str(pool)
                            .to_string()
                    };
                    println!("Device name: {:?}", name);
                    let _ = tauri_event_emiter.emit("removed_device", name);
                });
            }
        }
    }
);

impl MyBrowserDelegate {
    pub fn new(
        tauri_event_emiter: Option<AppHandle>,
        app_state: Arc<Mutex<Option<ScanOperation>>>,
    ) -> Retained<Self> {
        println!("Creating MyBrowserDelegate");
        let this = MyBrowserDelegate::alloc();
        let this = this.set_ivars(Ivars {
            tauri_event_emiter,
            scan_ops_related_info: app_state,
        });
        unsafe { msg_send![super(this), init] }
    }
}

unsafe fn scanner_is_the_one(expected_device_name: &str, device_name: Retained<NSString>) -> bool {
    let expected_ns_string = NSString::from_str(expected_device_name);
    device_name.isEqualToString(&*expected_ns_string)
}

unsafe fn setup_scanner_delegate(
    device: &ICDevice,
    tauri_event_emiter: Option<AppHandle>,
    app_state: Arc<Mutex<Option<ScanOperation>>>,
) -> Retained<MyScannerDelegate> {
    let scanner_delegate = MyScannerDelegate::new(tauri_event_emiter, app_state);
    let object = ProtocolObject::from_ref(&*scanner_delegate);
    device.setDelegate(Some(object));
    scanner_delegate
}

unsafe fn produceRetained(device: &ICDevice) -> Retained<ICDevice> {
    let device = Retained::from(device.retain());
    device
}
