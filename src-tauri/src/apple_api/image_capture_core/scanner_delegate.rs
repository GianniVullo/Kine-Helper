use crate::apple_api::image_capture_core::ImageCaptureCore::{
    ICDevice, ICDeviceDelegate, ICScannerBandData, ICScannerBitDepth, ICScannerDevice,
    ICScannerDeviceDelegate, ICScannerFunctionalUnit, ICScannerMeasurementUnit,
    ICScannerPixelDataType,
};
use crate::apple_api::state::ScanOperation;
use crate::cloud::image_compression::tiff_to_avif;
use objc2::rc::autoreleasepool;
use objc2::DefinedClass;
use objc2::{define_class, msg_send, rc::Retained, AllocAnyThread};
use objc2_foundation::{NSError, NSObject, NSObjectProtocol, NSPoint, NSRect, NSSize, NSURL};
use std::cell::RefCell;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

#[derive(Debug)]
pub struct Ivars {
    tauri_event_emiter: Option<AppHandle>,
    scan_ops_related_info: Arc<Mutex<Option<ScanOperation>>>,
}

define_class!(
    #[derive(Debug)]
    #[unsafe(super(NSObject))]
    #[name = "MyScannerDelegate"]
    #[ivars = Ivars]
    pub struct MyScannerDelegate;

    unsafe impl NSObjectProtocol for MyScannerDelegate {}

    unsafe impl ICDeviceDelegate for MyScannerDelegate {
        #[unsafe(method(device:didOpenSessionWithError:))]
        unsafe fn device_didOpenSessionWithError(
            &self,
            device: &ICDevice,
            error: Option<&NSError>,
        ) {
            if let Some(error) = error {
                println!("Error opening session: {:?}", error.localizedDescription());
            } else {
                println!("Scanner session opened successfully.");
                if let Some(emiter) = self.ivars().tauri_event_emiter.as_ref() {
                    let _ = emiter.emit("scanner_session_opened", "opened");
                }
                // Start the scan process here if needed
            }
        }

        #[unsafe(method(device:didCloseSessionWithError:))]
        unsafe fn device_didCloseSessionWithError(
            &self,
            device: &ICDevice,
            error: Option<&NSError>,
        ) {
            if let Some(error) = error {
                println!("Error closing session: {:?}", error.localizedDescription());
            } else {
                println!("Scanner session closed successfully.");
            }
        }
        #[unsafe(method(didRemoveDevice:))]
        unsafe fn didRemoveDevice(&self, device: &ICDevice) {
            println!("Scanner device removed: {:?}", unsafe { device.name() });
            // Handle the removal of the scanner device
        }
    }

    unsafe impl ICScannerDeviceDelegate for MyScannerDelegate {
        #[unsafe(method(scannerDeviceDidBecomeAvailable:))]
        fn scannerDeviceDidBecomeAvailable(&self, scanner: &ICScannerDevice) {
            println!("Scanner is available: {:?}", unsafe { scanner.name() });
            // unsafe { scanner.requestScan() };
        }

        #[unsafe(method(scannerDevice:didScanToBandData:))]
        unsafe fn scannerDevice_didScanToBandData(
            &self,
            scanner: &ICScannerDevice,
            data: &ICScannerBandData,
        ) {
            println!("📸 Scanned image data: {:?}", data);
            // Handle the scanned image data here
        }

        #[unsafe(method(scannerDevice:didScanToURL:))]
        fn scannerDevice_didScanToURL(&self, scanner: &ICScannerDevice, url: &NSURL) {
            println!("📸 Scanned image saved to: {:?}", unsafe { url.path() });
            unsafe { scanner.requestCloseSession() };
            let cloned_arc = self.ivars().scan_ops_related_info.clone();

            let extracted_infos = {
                let lock = cloned_arc.lock().unwrap();
                lock.as_ref().map(|info| {
                    (
                        info.scanner_name.clone(),
                        info.document_name.clone(),
                        info.document_path.clone(),
                    )
                })
            };
            autoreleasepool(|pool| {
                if let Some((scanner_name, document_name, document_path)) = extracted_infos {
                    println!("operation_infos: {:?}", scanner_name);
                    println!("document_name: {:?}", document_name);
                    println!("document_path: {:?}", document_path);
                    if let Some(from) = unsafe { url.path() } {
                        let bytes = tiff_to_avif(
                            unsafe { from.to_str(pool) },
                            &document_path,
                            &document_name,
                        );
                        if let Some(emiter) = self.ivars().tauri_event_emiter.as_ref() {
                            let _ = emiter.emit("scan_done", bytes);
                        }
                    }
                }
            });
        }

        #[unsafe(method(device:didOpenWithError:))]
        fn device_didOpenWithError(&self, _scanner: &ICDevice, error: Option<&NSError>) {
            if let Some(error) = error {
                println!("Error opening device: {:?}", error.localizedDescription());
            } else {
                println!("Scanner opened successfully.");
            }
        }
        #[unsafe(method(scannerDevice:didSelectFunctionalUnit:error:))]
        unsafe fn scannerDevice_didSelectFunctionalUnit_error(
            &self,
            scanner: &ICScannerDevice,
            functional_unit: &ICScannerFunctionalUnit,
            error: Option<&NSError>,
        ) {
            if let Some(error) = error {
                println!(
                    "Error selecting functional unit: {:?}",
                    error.localizedDescription()
                );
            } else {
                println!("Functional unit selected: {:?}", functional_unit);
                functional_unit.setMeasurementUnit(ICScannerMeasurementUnit::Centimeters);
                functional_unit.setScanArea(NSRect {
                    origin: NSPoint { x: 0.0, y: 0.0 },
                    size: NSSize {
                        width: 21.59,
                        height: 29.70,
                    }, // A4 full bed
                });
                functional_unit.setResolution(200); // Better DPI
                functional_unit.setBitDepth(ICScannerBitDepth::Depth8Bits);
                functional_unit.setPixelDataType(ICScannerPixelDataType::RGB);
                println!("Requesting scan...");
                scanner.requestScan();
            }
        }
        #[unsafe(method(scannerDevice:didCompleteOverviewScanWithError:))]
        unsafe fn scannerDevice_didCompleteOverviewScanWithError(
            &self,
            scanner: &ICScannerDevice,
            error: Option<&NSError>,
        ) {
            if let Some(error) = error {
                println!(
                    "Error completing overview scan: {:?}",
                    error.localizedDescription()
                );
            } else {
                println!("Overview scan completed successfully.");
                scanner.requestScan();
                // Handle the overview scan completion here
            }
        }

        #[unsafe(method(scannerDevice:didCompleteScanWithError:))]
        unsafe fn scannerDevice_didCompleteScanWithError(
            &self,
            scanner: &ICScannerDevice,
            error: Option<&NSError>,
        ) {
            if let Some(error) = error {
                println!("Error completing scan: {:?}", error.localizedDescription());
            } else {
                println!("Scan completed successfully.");
                // Handle the scan completion here
            }
        }
    }
);

impl MyScannerDelegate {
    pub fn new(
        tauri_event_emiter: Option<AppHandle>,
        scan_ops_related_info: Arc<Mutex<Option<ScanOperation>>>,
    ) -> Retained<Self> {
        println!("Creating MyScannerDelegate");
        let this = MyScannerDelegate::alloc();
        let this = this.set_ivars(Ivars {
            tauri_event_emiter,
            scan_ops_related_info,
        });
        unsafe { msg_send![super(this), init] }
    }
}
